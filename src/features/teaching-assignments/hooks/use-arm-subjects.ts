"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";

import { addArmSubjects, getArmSubjects, removeArmSubject } from "../api/teaching-assignments-api";
import type { CreateClassArmSubjectPayload } from "../types";

// Keyed under the shared "academic-structure" prefix so useMutationWithToast's
// broad invalidation refreshes this list after a subject is offered or removed.
export function useArmSubjects(classArmId: string | null) {
  return useQuery({
    queryKey: ["academic-structure", "arm-subjects", classArmId],
    queryFn: () => getArmSubjects(classArmId as string),
    enabled: !!classArmId,
  });
}

export function useAddArmSubjects() {
  return useMutationWithToast(
    (payload: CreateClassArmSubjectPayload) => addArmSubjects(payload),
    "Subjects added to this class",
  );
}

export function useRemoveArmSubject() {
  const queryClient = useQueryClient();

  // Refused outright once any Score exists for (class_arm, subject) — the
  // offering is part of results history by then. The backend's message says so;
  // it surfaces through the shared error toast.
  return useMutationWithToast((id: string) => removeArmSubject(id), "Subject removed", () => {
    // Teacher assignments for the subject are NOT cleared by the backend, so
    // refresh the staff side to reflect whatever is actually left.
    queryClient.invalidateQueries({ queryKey: ["staff"] });
  });
}
