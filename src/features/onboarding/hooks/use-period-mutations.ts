"use client";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";

import { addPeriod, deletePeriod, updatePeriod } from "../api/review-api";
import type { AddPeriodPayload, UpdatePeriodPayload } from "../types-review";

export function useUpdatePeriod() {
  return useMutationWithToast(
    ({ id, payload }: { id: string; payload: UpdatePeriodPayload }) => updatePeriod(id, payload),
    "Saved",
  );
}

export function useDeletePeriod() {
  return useMutationWithToast((id: string) => deletePeriod(id), "Removed");
}

export function useAddPeriod() {
  return useMutationWithToast(
    ({ sessionId, payload }: { sessionId: string; payload: AddPeriodPayload }) => addPeriod(sessionId, payload),
    "Term added",
  );
}
