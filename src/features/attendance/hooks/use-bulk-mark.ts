"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { bulkMarkAttendance } from "../api/attendance-api";
import type { BulkMarkPayload } from "../types";

// A paused mutation is persisted as its key plus its variables — never its
// function. On a later page load the rehydrated entry has to find its mutationFn
// by key, so registering it here is what makes an offline register replayable at
// all rather than a stranded blob of JSON.
export const BULK_MARK_MUTATION_KEY = ["attendance", "bulk-mark"] as const;

export function registerBulkMarkDefaults(queryClient: QueryClient): void {
  queryClient.setMutationDefaults(BULK_MARK_MUTATION_KEY, {
    mutationFn: (payload: BulkMarkPayload) => bulkMarkAttendance(payload),
  });
}

export function useBulkMark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: BULK_MARK_MUTATION_KEY,
    mutationFn: (payload: BulkMarkPayload) => bulkMarkAttendance(payload),
    onSuccess: (result) => {
      // Prefix, not ["attendance","records"]: the teacher dashboard's
      // ["attendance","arm-history",...] tiles read the same data, and were
      // being left stale after a save.
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
      toast.success(`Register saved for ${result.applied.length} student${result.applied.length === 1 ? "" : "s"}.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
