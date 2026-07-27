"use client";

import { useQuery } from "@tanstack/react-query";

import { getSubjects } from "../api/subjects-api";

// Keyed under the shared "academic-structure" prefix so useMutationWithToast's
// broad invalidation (add/edit/delete subject) refreshes this list.
export const SUBJECTS_QUERY_KEY = ["academic-structure", "subjects"];

export function useSubjects() {
  return useQuery({
    queryKey: SUBJECTS_QUERY_KEY,
    queryFn: getSubjects,
  });
}
