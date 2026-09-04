import { isAxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import { CLASS_ARM_ENDPOINTS, FEE_ITEM_ENDPOINTS, PAYMENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { FeeCollectionPoint, FeeDefaulter, Payment } from "../types";

// Who in this arm still owes, for one term. Requires view_fees.
//
// A bare array, not a paginated envelope — the backend runs the ledger once per
// enrolled student and returns only those above zero, so an empty result means
// "nobody owes", never "not billed". academic_period_id is required.
export async function getArmDefaulters(
  classArmId: string,
  academicPeriodId: string,
): Promise<FeeDefaulter[]> {
  const { data } = await apiClient.get<FeeDefaulter[]>(CLASS_ARM_ENDPOINTS.FEE_DEFAULTERS(classArmId), {
    params: { academic_period_id: academicPeriodId },
  });
  return data;
}

// The school's whole payment log, newest first. Requires view_fees.
//
// Same endpoint the per-student history uses, just unfiltered by student, so it
// keeps a page envelope and real pagination here — a busy term is thousands of
// rows, unlike one child's handful.
export async function getPayments(params: {
  page: number;
  page_size: number;
  status?: string;
  fee_item?: string;
}): Promise<PaginatedResponse<Payment>> {
  const { data } = await apiClient.get<PaginatedResponse<Payment>>(PAYMENT_ENDPOINTS.LIST(), {
    params,
  });
  return data;
}

// Collected vs outstanding per recent term, for the dashboard chart.
//
// Gated on view_analytics rather than view_fees, so an admin who can do
// everything else in this module may still be refused here. A 403 returns an
// empty series instead of throwing: this runs inside the combined charts query
// alongside enrolment and attendance, and one refused chart must not blank the
// other two. Any other failure still throws — an empty chart is the right answer
// for "not allowed", not for "the server broke".
export async function getCollectionSummary(): Promise<FeeCollectionPoint[]> {
  try {
    const { data } = await apiClient.get<FeeCollectionPoint[]>(
      FEE_ITEM_ENDPOINTS.COLLECTION_SUMMARY(),
    );
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) return [];
    throw error;
  }
}
