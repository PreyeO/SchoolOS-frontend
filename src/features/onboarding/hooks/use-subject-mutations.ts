"use client";

import { createSubjects } from "../api/onboarding-api";
import { deleteSubject, updateSubject } from "../api/review-api";
import { useReviewMutation } from "./use-review-mutation";
import type { CreateSubjectsPayload } from "../types";
import type { UpdateSubjectPayload } from "../types-review";

export function useUpdateSubject() {
  return useReviewMutation(
    ({ id, payload }: { id: string; payload: UpdateSubjectPayload }) => updateSubject(id, payload),
    "Saved",
  );
}

export function useDeleteSubject() {
  return useReviewMutation((id: string) => deleteSubject(id), "Removed");
}

export function useAddSubjects() {
  return useReviewMutation((payload: CreateSubjectsPayload) => createSubjects(payload), "Subject added");
}
