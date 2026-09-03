"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyAssignments } from "../api/teaching-assignments-api";

// The signed-in teacher's own assignments. This is the one teaching endpoint a
// teacher can call without an admin permission, which makes it the backbone of
// the teacher experience — it's how they discover which arms they touch at all.
// `enabled` is not an optimisation here. The endpoint raises
// "Only teachers have subject assignments." for a caller with no teacher
// profile — it doesn't return an empty list — so calling it as an admin is an
// error, not an empty result.
export function useMyAssignments(enabled = true) {
  return useQuery({
    queryKey: ["my-assignments"],
    queryFn: getMyAssignments,
    enabled,
  });
}
