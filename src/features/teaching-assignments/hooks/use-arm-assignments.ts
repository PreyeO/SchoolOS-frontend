"use client";

import { useQuery } from "@tanstack/react-query";

import { getArmAssignments } from "../api/teaching-assignments-api";

// Keyed under the shared "academic-structure" prefix so useMutationWithToast's
// broad invalidation refreshes this list after an assign or unassign.
export function useArmAssignments(classArmId: string | null) {
  return useQuery({
    queryKey: ["academic-structure", "subject-assignments", classArmId],
    queryFn: () => getArmAssignments(classArmId as string),
    enabled: !!classArmId,
  });
}
