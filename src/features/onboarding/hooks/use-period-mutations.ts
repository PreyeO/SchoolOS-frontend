"use client";

import { addPeriod, deletePeriod, updatePeriod } from "../api/review-api";
import { useReviewMutation } from "./use-review-mutation";
import type { AddPeriodPayload, UpdatePeriodPayload } from "../types-review";

export function useUpdatePeriod() {
  return useReviewMutation(
    ({ id, payload }: { id: string; payload: UpdatePeriodPayload }) => updatePeriod(id, payload),
    "Saved",
  );
}

export function useDeletePeriod() {
  return useReviewMutation((id: string) => deletePeriod(id), "Removed");
}

export function useAddPeriod() {
  return useReviewMutation(
    ({ sessionId, payload }: { sessionId: string; payload: AddPeriodPayload }) => addPeriod(sessionId, payload),
    "Term added",
  );
}
