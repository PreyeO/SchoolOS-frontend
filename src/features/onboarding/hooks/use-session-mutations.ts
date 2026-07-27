"use client";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";

import { deleteSession, updateSession } from "../api/review-api";

export function useUpdateSessionName() {
  return useMutationWithToast(
    ({ id, name }: { id: string; name: string }) => updateSession(id, { name }),
    "Saved",
  );
}

export function useDeleteSession() {
  return useMutationWithToast((id: string) => deleteSession(id), "Removed");
}
