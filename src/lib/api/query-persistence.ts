import type { Query } from "@tanstack/react-query";

import { AUTH_STORAGE_KEY, ssrSafeLocalStorage } from "@/lib/storage/ssr-safe-local-storage";

// Anything cached here has to survive being closed and reopened offline, so it
// outlives the session in localStorage. That makes scoping a correctness
// concern, not a tidiness one — see PERSIST_KEY_PREFIX below.

// Beyond seven days the refresh token has expired anyway, so a queued mark could
// not be synced even if it were still cached. That makes it the natural ceiling
// for both gcTime and the persister's maxAge.
export const OFFLINE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

// Exactly what the offline screens need, named key by key.
//
// This was a list of root prefixes, which was too blunt: "results" alone swept
// in nine query families — the admin review queue, class-arm results, report
// card settings, remarks (which are online-only by design), and report cards,
// which are keyed per student and so grew a localStorage entry for every child
// an admin looked at. All of it sitting on a possibly-shared device for a week,
// competing with the auth store for the same 5MB.
//
// Anything not listed here is simply refetched when the network returns.
const PERSISTED_KEYS: readonly (readonly string[])[] = [
  // Roster, the date's records, and the dashboard's arm history.
  ["attendance"],
  // The teacher's own arms. Without it there is no register to open.
  ["me"],
  // Classes and subjects — the attendance picker gates on them.
  ["academic-structure"],
  // Which (arm, subject) pairs this teacher may enter scores for. It's the
  // authorisation as much as the picker.
  ["my-assignments"],
  // The components a score is entered against, and each one's maximum. Narrower
  // than the whole "settings" root, which also holds the permissions catalog.
  ["settings", "grading-systems"],
  // Score entry's own two: the grid, and whether it's still editable.
  ["results", "scores"],
  ["results", "submission"],
];

export function shouldPersistQuery(query: Query): boolean {
  // Successful queries only, and this line is load-bearing.
  //
  // Passing this as dehydrateOptions.shouldDehydrateQuery *replaces*
  // query-core's default, which is exactly `status === "success"`. Without the
  // check we also dehydrated pending ones — and dehydrateQuery attaches a live
  // `promise` field to those, which JSON.stringify writes out as `{}`. On the
  // next start hydrate() calls tryResolveSync on that object, `{}.then` is not
  // a function, and persistQueryClientRestore's catch responds by calling
  // persister.removeClient() — deleting the whole cache — and rethrowing.
  //
  // Offline is precisely when queries sit at status "pending" (fetchStatus
  // "paused"), and the persister saves on every cache event. So one offline
  // session wrote a poisoned blob, every later start wiped the cache on
  // restore, and the rethrow meant PersistQueryClientProvider's onSuccess —
  // which is what calls resumePausedMutations — never ran. Queued registers
  // and score batches were left unreplayed. Nothing offline worked twice.
  if (query.state.status !== "success") return false;

  return PERSISTED_KEYS.some((prefix) =>
    prefix.every((segment, i) => query.queryKey[i] === segment),
  );
}

// Scoped per membership, following the schoolos-checklist-dismissed:{schoolId}
// precedent. A staffroom device is shared: without this, the next teacher to log
// in would rehydrate the previous one's roster and register, and a persisted
// paused mutation could be replayed under the wrong identity.
const PERSIST_KEY_PREFIX = "schoolos-query-cache";

export function persistKeyFor(membershipId: string | null | undefined): string {
  return `${PERSIST_KEY_PREFIX}:${membershipId ?? "anonymous"}`;
}

// The signed-in membership, read straight out of auth-store's persisted blob
// rather than through useAuthStore.
//
// It has to be correct synchronously, on the very first render, and the React
// store cannot be: zustand serves getInitialState() as the hydration snapshot,
// which is the state from *before* persist wrote into it, so `claims` is null
// there. QueryProvider bakes the key into a useState initializer that never
// re-runs, so reading it through the store pinned every device to
// ":anonymous" — self-consistent, and therefore invisible, but it meant the
// per-membership scoping this module promises above was never actually
// happening. On a shared staffroom device that is the whole point of the key.
export function readPersistedMembershipId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const id = JSON.parse(raw)?.state?.claims?.membership_id;
    return typeof id === "string" ? id : null;
  } catch {
    // Unparseable or storage unavailable. Falls back to the anonymous key,
    // which is still self-consistent — just unscoped.
    return null;
  }
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
