import { apiClient } from "@/lib/api/client";
import { FEE_ITEM_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { CreateFeeItemPayload, FeeItem, UpdateFeeItemPayload } from "../types";

// Every fee item on one class for one term, active and inactive alike.
//
// `is_active` is deliberately NOT sent even though the backend accepts it: the
// screen needs both sets anyway — active rows to bill and total, deactivated
// ones to explain where a since-retired charge went — and one class/term holds
// at most a handful of items, so filtering the two apart client-side is cheaper
// than two request variants and makes the Show inactive toggle instant.
//
// page_size=100 (the backend maximum) because there is no pagination UI here. A
// class charging more than 100 distinct lines in a single term isn't a real
// case; if it ever is, this needs pagination rather than a larger page.
export async function getFeeItems(klassId: string, academicPeriodId: string): Promise<FeeItem[]> {
  const { data } = await apiClient.get<PaginatedResponse<FeeItem>>(FEE_ITEM_ENDPOINTS.LIST(), {
    params: { klass: klassId, academic_period: academicPeriodId, page_size: 100 },
  });
  return data.results;
}

// 400s when an active item of the same name already exists on this (class,
// period) — the name is unique per pair, case-insensitively. The message says
// so and reaches the user through the shared error toast.
export async function createFeeItem(payload: CreateFeeItemPayload): Promise<FeeItem> {
  const { data } = await apiClient.post<FeeItem>(FEE_ITEM_ENDPOINTS.LIST(), payload);
  return data;
}

// PATCH, not PUT: the backend's update serializer marks both fields optional and
// the view passes partial=True, so sending only what changed is the contract.
//
// Amount edits are allowed even after payments exist — balances are computed
// live, so raising an amount simply surfaces a fresh remainder on the next
// ledger read. There is no "locked because paid" state to respect here.
export async function updateFeeItem(id: string, payload: UpdateFeeItemPayload): Promise<FeeItem> {
  const { data } = await apiClient.patch<FeeItem>(FEE_ITEM_ENDPOINTS.DETAIL(id), payload);
  return data;
}

// Deletes the item, or deactivates it in place when any payment or waiver
// references it — the backend decides which, and returns 204 either way, so the
// response can't be read for the outcome. The refetched list is what shows it:
// a deactivated item comes back with is_active false, a deleted one is gone.
export async function deleteFeeItem(id: string): Promise<void> {
  await apiClient.delete(FEE_ITEM_ENDPOINTS.DETAIL(id));
}
