"use client";

import { useQuery } from "@tanstack/react-query";

import { getSchoolId } from "@/lib/school/get-school-id";

import { getOnboardingReview } from "../api/onboarding-api";

export function useOnboardingReview() {
  const schoolId = getSchoolId();

  return useQuery({
    queryKey: ["onboarding", "review", schoolId],
    queryFn: () => getOnboardingReview(schoolId as string),
    enabled: !!schoolId,
  });
}
