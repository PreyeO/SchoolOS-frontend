"use client";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";

import { createSubjects } from "../api/onboarding-api";
import { deleteSubject, updateSubject } from "../api/review-api";
import type { CreateSubjectsPayload } from "../types";
import type { UpdateSubjectPayload } from "../types-review";

export function useUpdateSubject() {
  return useMutationWithToast(
    ({ id, payload }: { id: string; payload: UpdateSubjectPayload }) => updateSubject(id, payload),
    "Saved",
  );
}

export function useDeleteSubject() {
  return useMutationWithToast((id: string) => deleteSubject(id), "Removed");
}

export function useAddSubjects() {
  return useMutationWithToast((payload: CreateSubjectsPayload) => createSubjects(payload), "Subject added");
}
