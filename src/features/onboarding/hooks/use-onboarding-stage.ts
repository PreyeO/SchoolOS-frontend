"use client";

import { useQuery } from "@tanstack/react-query";

import { getSchoolId } from "@/lib/school/get-school-id";

import { getOnboardingStage } from "../api/onboarding-api";

export function useOnboardingStage() {
  const schoolId = getSchoolId();

  return useQuery({
    queryKey: ["onboarding", "stage", schoolId],
    queryFn: () => getOnboardingStage(schoolId as string),
    enabled: !!schoolId,
  });
}
