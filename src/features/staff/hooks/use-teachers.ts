"use client";

import { useQuery } from "@tanstack/react-query";

import { getTeachers } from "../api/staff-api";
import type { TeacherFilters } from "../types";

export function useTeachers(filters: TeacherFilters) {
  return useQuery({
    queryKey: ["staff", "teachers", filters],
    queryFn: () => getTeachers(filters),
  });
}
