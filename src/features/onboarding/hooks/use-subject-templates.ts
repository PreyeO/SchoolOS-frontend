"use client";

import { useQuery } from "@tanstack/react-query";

import { getSubjectTemplates } from "../api/onboarding-api";

export function useSubjectTemplates() {
  return useQuery({
    queryKey: ["onboarding", "subject-templates"],
    queryFn: getSubjectTemplates,
  });
}
