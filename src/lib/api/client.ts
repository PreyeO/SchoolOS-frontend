import axios, { type AxiosRequestConfig } from "axios";

import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth-store";
import { ENDPOINTS } from "./endpoints";

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Public endpoints must never receive an Authorization header. A stale token in
// the store would otherwise be attached to signup/login and reject with 401.
// The refresh endpoint is included so it never gets a *stale access* token
// attached, and so its own 401s don't recurse into the refresh logic below.
const PUBLIC_PATHS = [
  "/api/users/", // signup
  "/api/auth/verify-email/",
  "/api/auth/resend-verification/",
  "/api/auth/login/",
  ENDPOINTS.PASSWORD_RESET_REQUEST,
  ENDPOINTS.PASSWORD_RESET_CONFIRM,
  ENDPOINTS.REFRESH,
];

function isPublicPath(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_PATHS.some((path) => url.includes(path));
}

apiClient.interceptors.request.use((config) => {
  if (!env.API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set. Add it to .env.local (or your deployment's environment variables).");
  }

  const token = useAuthStore.getState().tokens?.access;
  if (token && !isPublicPath(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Expired-access-token handling -----------------------------------------
// On any 401, try a silent refresh once and retry the original request. If the
// refresh itself fails (refresh token also expired/invalid), fall back to a
// clean logout instead of leaving the user stuck on a raw backend error.

const SESSION_EXPIRED_FLAG = "schoolos-session-expired";

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
  queue.forEach((resolve) => resolve(token));
  queue = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = useAuthStore.getState().tokens?.refresh;
  if (!refresh) return null;

  try {
    const { data } = await apiClient.post<{ access: string; refresh?: string }>(
      ENDPOINTS.REFRESH,
      { refresh },
    );
    useAuthStore.getState().setTokens({ access: data.access, refresh: data.refresh ?? refresh });
    return data.access;
  } catch {
    return null;
  }
}

function forceLogout() {
  useAuthStore.getState().clearAuth();
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_EXPIRED_FLAG, "1");
    window.location.href = "/login";
  }
}

interface RetriableConfig extends AxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const original = error.config as RetriableConfig | undefined;

    if (status !== 401 || !original || original._retried || isPublicPath(original.url)) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
          resolve(apiClient(original));
        });
      });
    }

    original._retried = true;
    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;
    flushQueue(newToken);

    if (!newToken) {
      forceLogout();
      return Promise.reject(error);
    }

    original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
    return apiClient(original);
  },
);

// Read by the login page to show a "session expired" toast once, after a
// forced logout redirected here.
export function consumeSessionExpiredFlag(): boolean {
  if (typeof window === "undefined") return false;
  const expired = sessionStorage.getItem(SESSION_EXPIRED_FLAG) === "1";
  if (expired) sessionStorage.removeItem(SESSION_EXPIRED_FLAG);
  return expired;
}
