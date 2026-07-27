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

export function useDeleteArm() {
  return useMutationWithToast((id: string) => deleteArm(id), "Removed");
}
