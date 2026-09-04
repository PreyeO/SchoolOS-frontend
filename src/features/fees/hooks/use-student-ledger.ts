"use client";

import { useQuery } from "@tanstack/react-query";

import { getStudentPayments } from "../api/payments-api";
import { getStudentLedger } from "../api/ledger-api";
import { getStudentWaivers } from "../api/waivers-api";
import { FEE_ITEMS_QUERY_KEY } from "./use-fee-items";

// All three keyed under the shared "fees" prefix, so recording a payment or
// waiving a fee refreshes the ledger, the history and the waiver map together —
// each mutation changes what at least two of them should say.

export function useStudentLedger(studentId: string | null, academicPeriodId: string | null) {
  return useQuery({
    queryKey: [FEE_ITEMS_QUERY_KEY, "ledger", studentId, academicPeriodId],
    queryFn: () => getStudentLedger(studentId as string, academicPeriodId as string),
    enabled: !!studentId && !!academicPeriodId,
  });
}

// Gated on view_fees by the caller rather than allowed to 403: a teacher can
// read the ledger above but not this, so the history section is simply absent
// for them instead of showing a permission error beside data they can see.
export function useStudentPayments(
  studentId: string | null,
  enabled: boolean,
  page: number,
  pageSize: number,
  status: string | null,
  feeItemId: string | null,
) {
  return useQuery({
    queryKey: [FEE_ITEMS_QUERY_KEY, "payments", studentId, page, pageSize, status, feeItemId],
    queryFn: () =>
      getStudentPayments(studentId as string, {
        page,
        page_size: pageSize,
        ...(status ? { status } : {}),
        ...(feeItemId ? { fee_item: feeItemId } : {}),
      }),
    enabled: !!studentId && enabled,
    // Keeps the current page/filter's results on screen while the next
    // combination loads, instead of collapsing to a spinner on every change.
    placeholderData: (previous) => previous,
  });
}

// Only fetched when the caller can act on waivers. The ledger already reports
// *whether* a row is waived; this exists purely to recover the waiver id needed
// to remove one, so there's nothing to show a viewer who couldn't remove it.
export function useStudentWaivers(studentId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: [FEE_ITEMS_QUERY_KEY, "waivers", studentId],
    queryFn: () => getStudentWaivers(studentId as string),
    enabled: !!studentId && enabled,
  });
}
