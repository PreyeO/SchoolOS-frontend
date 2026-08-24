import { apiClient } from "@/lib/api/client";
import { FEE_WAIVER_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { CreateWaiverPayload, FeeWaiver } from "../types";

// This student's waivers across every term.
//
// Fetched because the ledger doesn't carry them: its rows report `is_waived` but
// not the waiver's id, and removing one needs that id. Matching is by fee_item —
// a student can hold at most one waiver per item (unique_together), so the map
// is unambiguous.
//
// Requires view_fees, same as the payment list.
export async function getStudentWaivers(studentId: string): Promise<FeeWaiver[]> {
  const { data } = await apiClient.get<PaginatedResponse<FeeWaiver>>(FEE_WAIVER_ENDPOINTS.LIST(), {
    params: { student: studentId, page_size: 100 },
  });
  return data.results;
}

// Forgives one fee item in full. Requires edit_fees.
//
// 400s if the item is already waived for this student, or if it isn't active —
// a retired fee can't be waived, since it bills nobody to begin with.
export async function createWaiver(payload: CreateWaiverPayload): Promise<FeeWaiver> {
  const { data } = await apiClient.post<FeeWaiver>(FEE_WAIVER_ENDPOINTS.LIST(), payload);
  return data;
}

// Makes the item billable again for that student. Requires edit_fees. There is
// no PATCH — changing a waiver's reason means removing and recreating it.
export async function deleteWaiver(id: string): Promise<void> {
  await apiClient.delete(FEE_WAIVER_ENDPOINTS.DETAIL(id));
}
