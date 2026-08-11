"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";

import { addArmSubject, getArmSubjects, removeArmSubject } from "../api/teaching-assignments-api";
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

export function useAddArmSubject() {
  return useMutationWithToast(
    (payload: CreateClassArmSubjectPayload) => addArmSubject(payload),
    "Subject added to this class",
  );
}

export function useRemoveArmSubject() {
  const queryClient = useQueryClient();

  return useMutationWithToast((id: string) => removeArmSubject(id), "Subject removed", () => {
    // Removing an offering can cascade to its teacher assignments, so refresh
    // the staff side too rather than leaving a teacher listed as teaching it.
    queryClient.invalidateQueries({ queryKey: ["staff"] });
  });
}
