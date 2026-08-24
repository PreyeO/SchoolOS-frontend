"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { FEE_ITEMS_QUERY_KEY } from "./use-fee-items";

// Same success-toast / error-toast / invalidate shape as the shared
// useMutationWithToast, but scoped to the "fees" key.
//
// Not a call into that helper: it invalidates ["onboarding","review"] and
// ["academic-structure"], and these screens have useClasses and
// useAcademicSessions mounted under the latter — so every fee edit would refetch
// the school's whole class and session list to no purpose. The shared helper is
// right for academic structure; fees are a different tree.
//
// Invalidating the whole "fees" prefix rather than a narrower key is deliberate:
// one payment changes the ledger row, the running total, and the payment
// history, and one waiver changes the ledger and the waiver map. Every fees
// mutation touches at least two queries, so there is no useful narrower target.
export function useFeesMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  successMessage: (result: TResult, args: TArgs) => string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (result, args) => {
      queryClient.invalidateQueries({ queryKey: [FEE_ITEMS_QUERY_KEY] });
      toast.success(successMessage(result, args));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
