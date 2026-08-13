"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";

import { createAssignments, deleteAssignment } from "../api/teaching-assignments-api";
import type { CreateSubjectAssignmentPayload } from "../types";

// An assignment shows up on the teacher's side too (staff detail), so both
// mutations invalidate ["staff"] on top of the academic-structure refresh
// useMutationWithToast already does.
function useInvalidateStaff() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["staff"] });
}

export function useCreateAssignments() {
  const invalidateStaff = useInvalidateStaff();

  return useMutationWithToast(
    (payload: CreateSubjectAssignmentPayload) => createAssignments(payload),
    "Teacher assigned",
    invalidateStaff,
  );
}

export function useDeleteAssignment() {
  const invalidateStaff = useInvalidateStaff();

  return useMutationWithToast((id: string) => deleteAssignment(id), "Assignment removed", invalidateStaff);
}
