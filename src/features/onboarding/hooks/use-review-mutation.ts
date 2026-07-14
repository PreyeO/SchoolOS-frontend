"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

// Shared shape for every Review edit/add/delete mutation: on success, refetch
// the review query (the single source of truth every Review row renders
// from) and toast a subtle confirmation; on failure, surface the backend's
// `detail` via the shared normalizer. onSuccessExtra covers the one case
// (branding) that also needs to sync a Zustand store.
export function useReviewMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  successMessage: string,
  onSuccessExtra?: (result: TResult) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      onSuccessExtra?.(result);
      queryClient.invalidateQueries({ queryKey: ["onboarding", "review"] });
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
