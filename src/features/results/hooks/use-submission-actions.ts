"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import { RESULT_SUBMISSION_ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/get-error-message";

import type { ResultSubmission } from "../types";

// Workflow transitions, deliberately online-only. Each is a single decision
// against server-held state, not a per-item race the way score entry is — there
// is no marked_at to resolve a conflict with, and queuing an approval offline
// would fire it blind at a state that may have moved underneath. See the score
// queue for the parts that genuinely are replay-safe.
function useSubmissionAction<TBody = void>(
  path: (id: string) => string,
  successMessage: string,
) {
  const queryClient = useQueryClient();

  return useMutation<ResultSubmission, Error, { id: string; body?: TBody }>({
    mutationFn: async ({ id, body }) => {
      const { data } = await apiClient.post<ResultSubmission>(path(id), body ?? {});
      return data;
    },
    onSuccess: () => {
      // Prefix: a transition moves the submission row, the review queue that
      // lists it, and whether the score grid is still editable.
      queryClient.invalidateQueries({ queryKey: ["results"] });
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Teacher-side. Refused unless the caller is the assigned teacher, at least one
// score exists, and the status is DRAFT or REJECTED.
export function useSubmitResult() {
  return useSubmissionAction(RESULT_SUBMISSION_ENDPOINTS.SUBMIT, "Sent for review");
}

// Admin-side, all three requiring a school permission: approve/reject need
// lock_results, unlock needs unlock_results.
export function useApproveResult() {
  return useSubmissionAction<{ comment?: string }>(
    RESULT_SUBMISSION_ENDPOINTS.APPROVE,
    "Result approved",
  );
}

export function useRejectResult() {
  return useSubmissionAction<{ comment: string }>(
    RESULT_SUBMISSION_ENDPOINTS.REJECT,
    "Sent back to the teacher",
  );
}

// Reverts APPROVED to SUBMITTED, reopening score entry. reason is required by
// the serializer — an unlock is the one transition that undoes a decision, so
// the backend insists it be accounted for.
export function useUnlockResult() {
  return useSubmissionAction<{ reason: string }>(
    RESULT_SUBMISSION_ENDPOINTS.UNLOCK,
    "Unlocked for correction",
  );
}
