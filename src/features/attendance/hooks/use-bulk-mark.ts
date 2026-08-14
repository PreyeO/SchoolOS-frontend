"use client";

import { useMutation, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { bulkMarkAttendance } from "../api/attendance-api";
import type { BulkMarkPayload, BulkMarkResponse } from "../types";

// A paused mutation is persisted as its key plus its variables — never its
// callbacks. When the app reloads, the rehydrated entry runs from these defaults
// alone, so *everything* that must happen on success lives here rather than in
// the component's useMutation options.
//
// That distinction caused a real bug: with only mutationFn registered, a
// register that resumed after a reload posted successfully but never invalidated
// its queries, so the page went on showing pre-sync data until a manual refresh.
export const BULK_MARK_MUTATION_KEY = ["attendance", "bulk-mark"] as const;

export function registerBulkMarkDefaults(queryClient: QueryClient): void {
  // setMutationDefaults is untyped by key, so the generics are stated here to
  // keep the callbacks honest about what they receive.
  queryClient.setMutationDefaults<BulkMarkResponse, Error, BulkMarkPayload>(
    BULK_MARK_MUTATION_KEY,
    {
      mutationFn: (payload) => bulkMarkAttendance(payload),

      onSuccess: (result) => {
        // Prefix, not ["attendance","records"]: the roster, the date's records
        // and the teacher dashboard's arm-history tiles all live under it, and
        // the dashboard was being left stale after a save.
        queryClient.invalidateQueries({ queryKey: ["attendance"] });

        // A 200 with a non-empty `skipped` is a partial success, not a failure:
        // those students already had a newer mark, so the server kept it. Saying
        // "saved" flatly would misreport what happened.
        if (result.skipped.length > 0) {
          toast.warning(
            `Saved ${result.applied.length}. ${result.skipped.length} skipped — a newer mark already exists for them.`,
          );
          return;
        }
        toast.success(
          `Register saved for ${result.applied.length} student${result.applied.length === 1 ? "" : "s"}.`,
        );
      },

      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    },
  );
}

// Deliberately thin: everything behavioural is on the defaults above, so a
// register saved in this tab and one resumed from storage behave identically.
export function useBulkMark() {
  return useMutation<BulkMarkResponse, Error, BulkMarkPayload>({
    mutationKey: BULK_MARK_MUTATION_KEY,
  });
}
