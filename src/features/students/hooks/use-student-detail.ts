"use client";

import { useQuery } from "@tanstack/react-query";

import { getStudentDetail } from "../api/students-api";

export const STUDENT_DETAIL_QUERY_KEY = (id: string) => ["students", "detail", id];

// `enabled` defaults true for the detail page's own use (id is always real
// there). Fees' deep-link resolver is the other caller — it only has an id
// once a ?student= param exists, and passes enabled: false until it does,
// rather than firing a request for an empty id.
export function useStudentDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: STUDENT_DETAIL_QUERY_KEY(id),
    queryFn: () => getStudentDetail(id),
    enabled,
  });
}
