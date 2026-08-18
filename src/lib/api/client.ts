import axios from "axios";

import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth-store";

import { ENDPOINTS } from "./endpoints";
import { installTokenRefresh } from "./token-refresh";

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Public endpoints must never receive an Authorization header. A stale token in
// the store would otherwise be attached to signup/login and reject with 401.
// The refresh endpoint is included so it never gets a *stale access* token
// attached, and so its own 401s don't recurse into the refresh logic.
//
// Every entry comes from ENDPOINTS rather than a literal. Four of these were
// hardcoded copies of the same paths, which meant renaming an endpoint would
// leave this list silently unmatched — and a stale token then rides along on
// login or signup and 401s the request. The bug would look like "login is
// broken", nowhere near the edit that caused it.
const PUBLIC_PATHS = [
  ENDPOINTS.USERS, // signup
  ENDPOINTS.VERIFY_EMAIL,
  ENDPOINTS.RESEND_OTP,
  ENDPOINTS.LOGIN,
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
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Add it to .env.local (or your deployment's environment variables).",
    );
  }

  const token = useAuthStore.getState().tokens?.access;
  if (token && !isPublicPath(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Silent-refresh-on-401, with the single-flight guard and forced logout — see
// token-refresh.ts. Installed here so this file stays the client definition and
// its request interceptor.
installTokenRefresh(apiClient, isPublicPath);

export { consumeSessionExpiredFlag } from "./token-refresh";
