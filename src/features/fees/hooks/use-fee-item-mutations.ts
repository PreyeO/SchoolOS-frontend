"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { createFeeItem, deleteFeeItem, updateFeeItem } from "../api/fee-items-api";
import { FEE_ITEMS_QUERY_KEY } from "./use-fee-items";
import type { CreateFeeItemPayload, UpdateFeeItemPayload } from "../types";

// Same success-toast / error-toast / invalidate shape as the shared
// useMutationWithToast, but scoped to the "fees" key.
//
// Not a call into that helper: it invalidates ["onboarding","review"] and
// ["academic-structure"], and this screen has useClasses and useAcademicSessions
// mounted under the latter — so every fee edit would refetch the school's whole
// class and session list to no purpose. The shared helper is right for academic
// structure; fees are a different tree.
function useFeesMutation<TArgs, TResult>(
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

export function useCreateFeeItem() {
  return useFeesMutation(
    (payload: CreateFeeItemPayload) => createFeeItem(payload),
    (item) => `${item.name} added`,
  );
}

export function useUpdateFeeItem() {
  return useFeesMutation(
    ({ id, payload }: { id: string; payload: UpdateFeeItemPayload }) => updateFeeItem(id, payload),
    (item) => `${item.name} updated`,
  );
}

// The toast stays neutral about delete-vs-deactivate on purpose: the backend
// picks between them based on whether payments or waivers reference the item and
// returns 204 either way, so claiming either outcome here would be a guess. The
// confirm dialog explains both up front, and the refetched list settles it — a
// deactivated item reappears under Show inactive, a deleted one doesn't.
export function useDeleteFeeItem() {
  return useFeesMutation(
    ({ id }: { id: string; name: string }) => deleteFeeItem(id),
    (_result, { name }) => `${name} removed from billing`,
  );
}
