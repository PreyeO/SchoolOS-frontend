"use client";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";

import { addArm, deleteArm, updateArm } from "../api/review-api";

export function useAddArm() {
  return useMutationWithToast(
    ({ classId, name }: { classId: string; name: string }) => addArm(classId, { name }),
    "Arm added",
  );
}

export function useUpdateArm() {
  return useMutationWithToast(({ id, name }: { id: string; name: string }) => updateArm(id, { name }), "Saved");
}

// "Removed from active use", not "Removed" — a DELETE returns 204 whether the
// arm was actually deleted or merely deactivated (history depends on it), and
// the response body doesn't say which. The old wording contradicted the row
// that reappears a moment later wearing a Deactivated badge. This phrasing is
// true either way.
//
// The shared invalidation in useMutationWithToast is what makes that reappear
// correctly — do NOT optimistically drop the row, since it may still exist.
export function useDeleteArm() {
  return useMutationWithToast((id: string) => deleteArm(id), "Removed from active use");
}
