"use client";

import { useQuery } from "@tanstack/react-query";

import { getSchoolId } from "@/lib/school/get-school-id";
import { getSchoolDetail } from "@/lib/school/get-school-detail";

export const SCHOOL_PROFILE_QUERY_KEY = ["settings", "school-profile"];

export function useSchoolProfile() {
  const schoolId = getSchoolId();

  return useQuery({
    queryKey: [...SCHOOL_PROFILE_QUERY_KEY, schoolId],
    queryFn: () => getSchoolDetail(schoolId as string),
    enabled: !!schoolId,
  });
}
