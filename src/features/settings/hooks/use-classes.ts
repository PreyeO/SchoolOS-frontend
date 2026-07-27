"use client";

import { useQuery } from "@tanstack/react-query";

import { getClasses } from "../api/classes-api";

// Keyed under the shared "academic-structure" prefix so useMutationWithToast's
// broad invalidation (add/edit/delete class or arm) refreshes this list.
export const CLASSES_QUERY_KEY = ["academic-structure", "classes"];

export function useClasses() {
  return useQuery({
    queryKey: CLASSES_QUERY_KEY,
    queryFn: getClasses,
  });
}
