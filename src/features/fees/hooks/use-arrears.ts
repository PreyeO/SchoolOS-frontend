"use client";

import { useQuery } from "@tanstack/react-query";

import { getArmDefaulters, getPayments } from "../api/arrears-api";
import { FEE_ITEMS_QUERY_KEY } from "./use-fee-items";

// Both under the shared "fees" prefix, so recording a payment anywhere in the
// module refreshes them — settling a balance is exactly what removes a student
// from the arrears list.

export function useArmDefaulters(classArmId: string | null, academicPeriodId: string | null) {
  return useQuery({
    queryKey: [FEE_ITEMS_QUERY_KEY, "defaulters", classArmId, academicPeriodId],
    queryFn: () => getArmDefaulters(classArmId as string, academicPeriodId as string),
    enabled: !!classArmId && !!academicPeriodId,
  });
}

export function usePayments(
  page: number,
  pageSize: number,
  status: string | null,
  feeItemId: string | null,
) {
  return useQuery({
    queryKey: [FEE_ITEMS_QUERY_KEY, "payment-log", page, pageSize, status, feeItemId],
    queryFn: () =>
      getPayments({
        page,
        page_size: pageSize,
        ...(status ? { status } : {}),
        ...(feeItemId ? { fee_item: feeItemId } : {}),
      }),
    // Keeps the previous page on screen while the next one loads, instead of
    // collapsing the table to a spinner on every page change.
    placeholderData: (previous) => previous,
  });
}
