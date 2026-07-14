"use client";

import { deleteSession, updateSession } from "../api/review-api";
import { useReviewMutation } from "./use-review-mutation";

export function useUpdateSessionName() {
  return useReviewMutation(
    ({ id, name }: { id: string; name: string }) => updateSession(id, { name }),
    "Saved",
  );
}

export function useDeleteSession() {
  return useReviewMutation((id: string) => deleteSession(id), "Removed");
}
