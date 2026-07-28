"use client";

import { useQuery } from "@tanstack/react-query";

import { getStudents } from "../api/students-api";
import type { StudentFilters } from "../types";

export function useStudents(filters: StudentFilters) {
  return useQuery({
    queryKey: ["students", "list", filters],
    queryFn: () => getStudents(filters),
  });
}
