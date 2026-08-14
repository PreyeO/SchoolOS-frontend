"use client";

// TanStack Query provider. Wraps the app so all client components can use
// useQuery / useMutation, and persists the slice of cache that attendance needs
// to work offline.

import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
// The sync persister is deprecated in favour of this one, which accepts the same
// Storage-shaped object and simply awaits it.
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import {
  OFFLINE_WINDOW_MS,
  guardedLocalStorage,
  persistKeyFor,
  shouldPersistQuery,
} from "@/lib/api/query-persistence";
import { registerBulkMarkDefaults } from "@/features/attendance/hooks/use-bulk-mark";
import { useAuthStore } from "@/stores/auth-store";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Scopes the persisted cache to the signed-in membership so a shared device
  // never rehydrates one teacher's data for another. Membership, not school —
  // two teachers at the same school would collide on a school-level key.
  const membershipId = useAuthStore((s) => s.claims?.membership_id ?? null);

  const [queryClient] = useState(() => {
    const client = new QueryClient({
        defaultOptions: {
          queries: {
            // Long enough that a register cached today is still in memory to be
            // dehydrated after a week offline. The 5-minute default would evict
            // it long before the persister ever saw it.
            gcTime: OFFLINE_WINDOW_MS,
            // Deliberately left at the default 0: the app relies on
            // refetch-on-mount/focus for cross-session sync (docs/PROJECT.md).
            // Persisted data renders instantly and still revalidates behind it.
            staleTime: 0,
            // A flat retry count spent an attempt on failures that can never
            // succeed — a 403 is still a 403 the second time — while giving a
            // genuinely flaky mobile connection only one extra go.
            //
            // Nothing here fires when the device is offline: networkMode
            // "online" *pauses* queries instead, so this only covers the case
            // where the browser believes it's online but the request still
            // fails — a dropped packet, a sleeping backend, a CORS rejection.
            retry: (failureCount, error) => {
              const status = (error as { response?: { status?: number } })?.response?.status;
              if (status && status < 500) return false;
              return failureCount < 2;
            },
          },
          mutations: {
            // networkMode "online" (the default) is what makes an offline
            // mutation *pause* rather than fail — that pause is the queue.
            retry: 0,
          },
        },
      });

    // Must happen before any cache is restored: a rehydrated paused mutation
    // looks its function up by key, and finds nothing if this hasn't run.
    registerBulkMarkDefaults(client);
    return client;
  });

  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: guardedLocalStorage,
      key: persistKeyFor(membershipId),
    }),
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: OFFLINE_WINDOW_MS,
        dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
      }}
      // Replays anything that was paused while offline, once the cache has been
      // restored — otherwise a resumed mutation could run before the roster it
      // reports against is back.
      onSuccess={() => {
        queryClient.resumePausedMutations();
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
