"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";

import { assignClassTeacher, unassignClassTeacher } from "../api/review-api";

// Class teacher is stored once on ClassArm but surfaced on both sides: nested on
// the arm (classes/settings) and as class_arms on the teacher (staff directory).
// useMutationWithToast already refreshes the academic-structure side; these also
// invalidate the ["staff"] prefix — which covers both the teacher list and detail
// queries — so the staff pages don't keep showing a stale assignment.
function useInvalidateStaff() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["staff"] });
}

export function useAssignClassTeacher() {
  const invalidateStaff = useInvalidateStaff();

  return useMutationWithToast(
    ({ armId, teacherProfileId }: { armId: string; teacherProfileId: string }) =>
      assignClassTeacher(armId, teacherProfileId),
    "Class teacher assigned",
    invalidateStaff,
  );
}

export function useUnassignClassTeacher() {
  const invalidateStaff = useInvalidateStaff();

  return useMutationWithToast(
    (armId: string) => unassignClassTeacher(armId),
    "Class teacher removed",
    invalidateStaff,
  );
}
