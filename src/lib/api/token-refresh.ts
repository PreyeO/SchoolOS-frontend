import type { AxiosInstance, AxiosRequestConfig } from "axios";

import { readPersistedTokens } from "@/lib/auth/persisted-tokens";
import { AUTH_STORAGE_KEY } from "@/lib/storage/ssr-safe-local-storage";
import { useAuthStore } from "@/stores/auth-store";

import { ENDPOINTS } from "./endpoints";
import { isNetworkError } from "./get-error-message";

const SESSION_EXPIRED_FLAG = "schoolos-session-expired";
const REFRESH_LOCK = "schoolos-token-refresh";

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

// THE MULTI-TAB RACE (the "it logs me out randomly" report, 2026-11-11).
// Refresh tokens are single-use: the backend rotates them and blacklists the
// old one (ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION). With two tabs
// open when the 60-minute access token expires, tab A refreshes and saves the
// new pair to localStorage, but tab B's in-memory store still holds the old
// refresh token, so its own refresh is refused. The old recovery check
// compared against tab B's in-memory store (which never saw A's write), so
// it logged out, and clearAuth() then wiped the shared storage for A too.
//
// Fixed in layers, each enough on its own for the common case:
// 1. syncAuthAcrossTabs: every tab re-reads the store when another one writes it.
// 2. Before refreshing, adopt a newer pair another tab already saved.
// 3. Refreshes are serialised across tabs with a Web Lock where available
//    (secure contexts only; plain-http lvh.me dev hosts go without).
// 4. After a refused refresh, check STORAGE (not memory) for a winner first.

// The newer pair another tab saved, adopted into this tab's store (claims too,
// via rehydrate). Null when storage holds nothing newer than `sentRefresh`.
async function adoptNewerFromStorage(sentRefresh: string | undefined): Promise<string | null> {
  const stored = readPersistedTokens();
  if (!stored || stored.refresh === sentRefresh) return null;
  await useAuthStore.persist.rehydrate();
  return useAuthStore.getState().tokens?.access ?? stored.access;
}

function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  return locks?.request ? (locks.request(REFRESH_LOCK, fn) as Promise<T>) : fn();
}

// Keeps every tab's in-memory session in step with localStorage. Another tab
// refreshing hands this one the new pair; another tab signing out signs this
// one out too, rather than leaving it on a session that no longer exists.
export function syncAuthAcrossTabs() {
  if (typeof window === "undefined") return;
  window.addEventListener("storage", (event) => {
    if (event.key === AUTH_STORAGE_KEY) void useAuthStore.persist.rehydrate();
  });
}

// On any 401, try a silent refresh once and retry the original request; if it's
// refused and no tab holds a newer pair, log out cleanly. Takes the client as
// an argument so this stays a leaf module. The single-flight state in this
// closure makes one refresh serve every request that 401s together in this tab.
export function installTokenRefresh(
  client: AxiosInstance,
  isPublicRequest: (config: { url?: string; method?: string }) => boolean,
) {
  let isRefreshing = false;
  let queue: Array<(token: string | null) => void> = [];

  function flushQueue(token: string | null) {
    queue.forEach((resolve) => resolve(token));
    queue = [];
  }

  async function refreshAccessToken(): Promise<{ token: string | null; unreachable: boolean }> {
    const sent = useAuthStore.getState().tokens?.refresh;
    if (!sent && !readPersistedTokens()) return { token: null, unreachable: false };

    const adopted = await adoptNewerFromStorage(sent);
    if (adopted) return { token: adopted, unreachable: false };

    return withRefreshLock(async () => {
      // Another tab may have refreshed while this one waited for the lock.
      const won = await adoptNewerFromStorage(sent);
      if (won) return { token: won, unreachable: false };

      const refresh = useAuthStore.getState().tokens?.refresh;
      if (!refresh) return { token: null, unreachable: false };
      try {
        const { data } = await client.post<{ access: string; refresh?: string }>(ENDPOINTS.REFRESH, { refresh });
        useAuthStore.getState().setTokens({ access: data.access, refresh: data.refresh ?? refresh });
        return { token: data.access, unreachable: false };
      } catch (error) {
        // Refused: but if another tab (or auth-handoff's rotate) saved a newer
        // pair meanwhile, the session is fine and that pair is the one to use.
        const late = await adoptNewerFromStorage(refresh);
        if (late) return { token: late, unreachable: false };
        // Never reached the server: the session may be valid, we just couldn't
        // ask. Not a logout, which would strand an offline register's marks.
        return { token: null, unreachable: isNetworkError(error) };
      }
    });
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

      if (status !== 401 || !original || original._retried || isPublicRequest(original)) {
        return Promise.reject(error);
      }

      // Sent with an access token this tab has since replaced (another tab's
      // refresh arrived via syncAuthAcrossTabs): just retry with the current one.
      const current = useAuthStore.getState().tokens?.access;
      const sentWith = String(original.headers?.Authorization ?? "");
      if (current && sentWith && sentWith !== `Bearer ${current}`) {
        original._retried = true;
        original.headers = { ...original.headers, Authorization: `Bearer ${current}` };
        return client(original);
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
        // the user signed in and let the request fail: they may be mid-lesson
        // with queued attendance, and clearAuth() would strand it.
        if (!unreachable) forceLogout();
        return Promise.reject(error);
      }

      original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
      return client(original);
    },
  );
}
