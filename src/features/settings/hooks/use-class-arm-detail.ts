"use client";

import { useQuery } from "@tanstack/react-query";

import { getClassArmDetail } from "../api/class-arm-detail-api";

// Keyed under the shared "academic-structure" prefix, so renaming an arm,
// assigning a class teacher or changing its subjects all refresh this — every
// one of those is a field on the response.
export function useClassArmDetail(id: string) {
  return useQuery({
    queryKey: ["academic-structure", "arm-detail", id],
    queryFn: () => getClassArmDetail(id),
  });
}
