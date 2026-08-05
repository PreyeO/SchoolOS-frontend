"use client";

import { useQuery } from "@tanstack/react-query";

import { getMySchools } from "@/lib/school/get-my-schools";
import { getSchoolId } from "@/lib/school/get-school-id";

export function useMySchools() {
  const schoolId = getSchoolId();

  return useQuery({
    queryKey: ["my-schools"],
    queryFn: getMySchools,
    enabled: !!schoolId,
  });
}
