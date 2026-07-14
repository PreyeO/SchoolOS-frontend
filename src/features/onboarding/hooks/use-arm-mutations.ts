"use client";

import { addArm, deleteArm, updateArm } from "../api/review-api";
import { useReviewMutation } from "./use-review-mutation";

export function useAddArm() {
  return useReviewMutation(
    ({ classId, name }: { classId: string; name: string }) => addArm(classId, { name }),
    "Arm added",
  );
}

export function useUpdateArm() {
  return useReviewMutation(({ id, name }: { id: string; name: string }) => updateArm(id, { name }), "Saved");
}

export function useDeleteArm() {
  return useReviewMutation((id: string) => deleteArm(id), "Removed");
}
