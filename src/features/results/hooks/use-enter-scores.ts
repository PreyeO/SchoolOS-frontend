"use client";

import { useMutation, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { bulkEnterScores } from "../api/results-api";
import type { BulkScoreEntryPayload, BulkScoreEntryResponse } from "../types";

// A paused mutation is persisted as its key plus its variables — never its
// callbacks. When the app reloads, the rehydrated entry runs from these defaults
// alone, so everything that must happen on success or failure lives here rather
// than in the component's useMutation options. The same distinction caused a
// real bug in attendance: with only mutationFn registered, a resumed batch
// posted fine but never invalidated, leaving pre-sync data on screen.
export const SCORE_ENTRY_MUTATION_KEY = ["results", "bulk-enter"] as const;

export function registerScoreEntryDefaults(queryClient: QueryClient): void {
  queryClient.setMutationDefaults<BulkScoreEntryResponse, Error, BulkScoreEntryPayload>(
    SCORE_ENTRY_MUTATION_KEY,
    {
      mutationFn: (payload) => bulkEnterScores(payload),

      onSuccess: (result) => {
        // Prefix: entering scores moves both the grid and the submission row
        // (the backend creates it on first entry).
        queryClient.invalidateQueries({ queryKey: ["results"] });

        if (result.skipped.length > 0) {
          toast.warning(
            `Saved ${result.applied.length}. ${result.skipped.length} skipped — a newer score already exists.`,
          );
          return;
        }
        toast.success(
          `Saved ${result.applied.length} score${result.applied.length === 1 ? "" : "s"}.`,
        );
      },

      onError: (error) => {
        // Unlike attendance, this can fail *wholesale*: the backend refuses the
        // entire batch if the subject was approved between entry and sync. The
        // draft is deliberately not cleared anywhere on this path, so the scores
        // stay on the device and the teacher still has them to re-enter or
        // escalate. See useLastScoreRejection, which surfaces it durably.
        toast.error(getErrorMessage(error));
      },
    },
  );
}

// Deliberately thin: everything behavioural is on the defaults above, so a batch
// saved in this tab and one resumed from storage behave identically.
export function useEnterScores() {
  return useMutation<BulkScoreEntryResponse, Error, BulkScoreEntryPayload>({
    mutationKey: SCORE_ENTRY_MUTATION_KEY,
  });
}
