"use client";

import { useQuery } from "@tanstack/react-query";

import { getSchoolId } from "@/lib/school/get-school-id";

import { getGradingSystems } from "../api/grading-api";

export const GRADING_SYSTEMS_QUERY_KEY = ["settings", "grading-systems"];

export function useGradingSystems() {
  const schoolId = getSchoolId();

  return useQuery({
    queryKey: GRADING_SYSTEMS_QUERY_KEY,
    queryFn: getGradingSystems,
    enabled: !!schoolId,
  });
}
