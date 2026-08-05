"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import {
  createGradingSystem,
  deleteGradingSystem,
  updateGradingSystem,
  type CreateGradingSystemPayload,
  type UpdateGradingSystemPayload,
} from "../api/grading-api";
import { GRADING_SYSTEMS_QUERY_KEY } from "./use-grading-systems";

// Not using the shared useMutationWithToast factory — that one invalidates
// onboarding review + academic-structure, neither of which grading systems
// are part of (grading isn't an onboarding step). Own query key instead.
function useGradingMutation<TArgs>(mutationFn: (args: TArgs) => Promise<unknown>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRADING_SYSTEMS_QUERY_KEY });
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateGradingSystem() {
  return useGradingMutation(
    (payload: CreateGradingSystemPayload) => createGradingSystem(payload),
    "Grading system added",
  );
}

export function useUpdateGradingSystem() {
  return useGradingMutation(
    ({ id, payload }: { id: string; payload: UpdateGradingSystemPayload }) => updateGradingSystem(id, payload),
    "Saved",
  );
}

export function useDeleteGradingSystem() {
  return useGradingMutation((id: string) => deleteGradingSystem(id), "Removed");
}
