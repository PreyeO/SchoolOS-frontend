"use client";

import { useQuery } from "@tanstack/react-query";

import { getFeeItems } from "../api/fee-items-api";

// Keyed under its own "fees" prefix rather than "academic-structure": fee items
// are financial records, and the broad academic invalidation fired by every
// class/subject/session edit has no reason to refetch them. useFeeItemMutations
// invalidates this prefix itself.
export const FEE_ITEMS_QUERY_KEY = "fees";

export function useFeeItems(klassId: string | null, academicPeriodId: string | null) {
  return useQuery({
    queryKey: [FEE_ITEMS_QUERY_KEY, "items", klassId, academicPeriodId],
    queryFn: () => getFeeItems(klassId as string, academicPeriodId as string),
    enabled: !!klassId && !!academicPeriodId,
  });
}
