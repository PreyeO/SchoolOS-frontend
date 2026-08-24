"use client";

import { createFeeItem, deleteFeeItem, updateFeeItem } from "../api/fee-items-api";
import { useFeesMutation } from "./use-fees-mutation";
import type { CreateFeeItemPayload, UpdateFeeItemPayload } from "../types";

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
