import type { Query } from "@tanstack/react-query";

import { ssrSafeLocalStorage } from "@/lib/storage/ssr-safe-local-storage";

// Anything cached here has to survive being closed and reopened offline, so it
// outlives the session in localStorage. That makes scoping a correctness
// concern, not a tidiness one — see PERSIST_KEY_PREFIX below.

// Beyond seven days the refresh token has expired anyway, so a queued mark could
// not be synced even if it were still cached. That makes it the natural ceiling
// for both gcTime and the persister's maxAge.
export const OFFLINE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

// Only what the register needs to open and be marked offline. Persisting the
// whole cache would put the admin directories — every student, every teacher —
// into localStorage on a device that may be shared, for no offline benefit,
// while competing with the auth store for the same 5MB budget.
const PERSISTED_PREFIXES = [
  "attendance", // roster, that date's records, and the dashboard's arm history
  "me", // the teacher's own arms; without it there is no register to open
];

export function shouldPersistQuery(query: Query): boolean {
  const root = query.queryKey[0];
  return typeof root === "string" && PERSISTED_PREFIXES.includes(root);
}

// Scoped per membership, following the schoolos-checklist-dismissed:{schoolId}
// precedent. A staffroom device is shared: without this, the next teacher to log
// in would rehydrate the previous one's roster and register, and a persisted
// paused mutation could be replayed under the wrong identity.
const PERSIST_KEY_PREFIX = "schoolos-query-cache";

export function persistKeyFor(membershipId: string | null | undefined): string {
  return `${PERSIST_KEY_PREFIX}:${membershipId ?? "anonymous"}`;
}

// Called on logout. Clears every scoped cache rather than just the current one —
// a device that has seen several teachers shouldn't keep their data around after
// any one of them signs out.
export function clearPersistedQueryCaches(): void {
  if (typeof window === "undefined") return;
  try {
    const keys = Object.keys(window.localStorage);
    keys.forEach((key) => {
      if (key.startsWith(PERSIST_KEY_PREFIX)) window.localStorage.removeItem(key);
    });
  } catch {
    // Storage unavailable (private mode, disabled). Nothing to clear.
  }
}

// The persister writes the whole dehydrated cache on every change, so a full
// quota throws on a write path the app doesn't otherwise guard. Swallowing it
// here keeps a full localStorage from taking down the auth store, which shares
// the same budget — losing the offline cache is recoverable, losing the session
// is not.
export const guardedLocalStorage: Storage = {
  ...ssrSafeLocalStorage,
  setItem(key: string, value: string) {
    try {
      ssrSafeLocalStorage.setItem(key, value);
    } catch {
      // Over quota. The cache simply won't persist this round.
    }
  },
} as Storage;
