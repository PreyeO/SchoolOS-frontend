"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "./get-error-message";

// Shared shape for every academic-structure edit/add/delete mutation (onboarding
// Review and dashboard Settings both use this): on success, invalidate both the
// onboarding review query and the broad "academic-structure" prefix Settings'
// list queries key under (TanStack matches by key-prefix, so one call refreshes
// whichever surface(s) are mounted), then toast a subtle confirmation. On
// failure, surface the backend's `detail` via the shared normalizer.
// onSuccessExtra covers cases (e.g. branding) that also need to sync a Zustand store.
export function useMutationWithToast<TArgs, TResult>(
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
      queryClient.invalidateQueries({ queryKey: ["academic-structure"] });
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
