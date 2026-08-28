"use client";

import { useQuery } from "@tanstack/react-query";

import { getClassArmDetail } from "../api/class-arm-detail-api";

// Keyed under the shared "academic-structure" prefix, so renaming an arm,
// assigning a class teacher or changing its subjects all refresh this — every
// one of those is a field on the response.
// Accepts null so a caller that doesn't always have an arm can hold the hook
// idle rather than branch around it — a student with no current enrolment has
// no arm to fetch. Callers with a definite id are unaffected.
export function useClassArmDetail(id: string | null) {
  return useQuery({
    queryKey: ["academic-structure", "arm-detail", id],
    queryFn: () => getClassArmDetail(id as string),
    enabled: !!id,
  });
}
