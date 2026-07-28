"use client";

import { useQuery } from "@tanstack/react-query";

import { getStudentDetail } from "../api/students-api";

export const STUDENT_DETAIL_QUERY_KEY = (id: string) => ["students", "detail", id];

export function useStudentDetail(id: string) {
  return useQuery({
    queryKey: STUDENT_DETAIL_QUERY_KEY(id),
    queryFn: () => getStudentDetail(id),
  });
}
