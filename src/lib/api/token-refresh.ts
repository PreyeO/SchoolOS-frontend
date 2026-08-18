import type { AxiosInstance, AxiosRequestConfig } from "axios";

import { useAuthStore } from "@/stores/auth-store";

import { ENDPOINTS } from "./endpoints";
import { isNetworkError } from "./get-error-message";

const SESSION_EXPIRED_FLAG = "schoolos-session-expired";

interface RetriableConfig extends AxiosRequestConfig {
  _retried?: boolean;
}

// Read by the login page to show a "session expired" toast once, after a forced
// logout redirected here.
export function consumeSessionExpiredFlag(): boolean {
  if (typeof window === "undefined") return false;
  const expired = sessionStorage.getItem(SESSION_EXPIRED_FLAG) === "1";
  if (expired) sessionStorage.removeItem(SESSION_EXPIRED_FLAG);
  return expired;
}

// On any 401, try a silent refresh once and retry the original request. If the
// refresh itself fails (refresh token also expired/invalid), fall back to a
// clean logout rather than leaving the user on a raw backend error.
//
// Takes the client as an argument rather than importing it, which keeps this a
// leaf module — client.ts imports here, not the other way round. The
// single-flight state lives inside this closure for the same reason it was
// module-scoped before: one refresh must serve every request that 401s in the
// same window, or a burst of parallel calls each fires its own and they race to
// write the store.
export function installTokenRefresh(client: AxiosInstance, isPublicPath: (url?: string) => boolean) {
  let isRefreshing = false;
  let queue: Array<(token: string | null) => void> = [];

  function flushQueue(token: string | null) {
    queue.forEach((resolve) => resolve(token));
    queue = [];
  }

  async function refreshAccessToken(): Promise<{ token: string | null; unreachable: boolean }> {
    const refresh = useAuthStore.getState().tokens?.refresh;
    if (!refresh) return { token: null, unreachable: false };

    try {
      const { data } = await client.post<{ access: string; refresh?: string }>(ENDPOINTS.REFRESH, {
        refresh,
      });
      useAuthStore.getState().setTokens({ access: data.access, refresh: data.refresh ?? refresh });
      return { token: data.access, unreachable: false };
    } catch (error) {
      // True when the refresh never reached the server. The session may be
      // perfectly valid — we simply couldn't ask. Distinguished from a rejected
      // refresh token so a working user isn't logged out over a dropped
      // connection, which for an offline register means discarding unsynced marks.
      return { token: null, unreachable: isNetworkError(error) };
    }
  }

  function forceLogout() {
    useAuthStore.getState().clearAuth();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_EXPIRED_FLAG, "1");
      window.location.href = "/login";
    }
  }

  client.interceptors.response.use(
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
            resolve(client(original));
          });
        });
      }

      original._retried = true;
      isRefreshing = true;
      const { token: newToken, unreachable } = await refreshAccessToken();
      isRefreshing = false;
      flushQueue(newToken);

      if (!newToken) {
        // Only a refusal ends the session. If the server was unreachable we keep
        // the user signed in and let the request fail — they may be mid-lesson
        // with queued attendance, and clearAuth() would strand it.
        if (!unreachable) forceLogout();
        return Promise.reject(error);
      }

      original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
      return client(original);
    },
  );
}
