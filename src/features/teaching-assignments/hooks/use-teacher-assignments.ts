"use client";

import { useQuery } from "@tanstack/react-query";

import { getTeacherAssignments } from "../api/teaching-assignments-api";

// One teacher's assignments, read via the list endpoint's `teacher` filter
// rather than /my-assignments/ — that action only ever returns the *caller's*
// own, so it can't answer "what does this teacher teach" on a staff page.
// Keyed under ["staff", ...] so the assignment mutations' invalidation reaches it.
export function useTeacherAssignments(teacherProfileId: string) {
  return useQuery({
    queryKey: ["staff", "teachers", teacherProfileId, "assignments"],
    queryFn: () => getTeacherAssignments(teacherProfileId),
  });
}
