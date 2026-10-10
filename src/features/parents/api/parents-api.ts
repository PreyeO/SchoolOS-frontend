import { apiClient } from "@/lib/api/client";
import { PARENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { MembershipSummary } from "@/lib/api/profile-summary";
import type { PaginatedResponse } from "@/lib/api/types";

import type { ParentDetail, ParentFilters, ParentListItem } from "../types";

// Without is_parent the backend returns current parents only. Former
// (offboarded) parents are a separate list: is_parent=false returns ONLY them.
export async function getParents(filters: ParentFilters): Promise<PaginatedResponse<ParentListItem>> {
  const { data } = await apiClient.get<PaginatedResponse<ParentListItem>>(PARENT_ENDPOINTS.LIST(), {
    params: filters,
  });
  return data;
}

// The same rule applies to detail: a former parent 404s unless `former` sends
// is_parent=false — and a current parent 404s if it does.
export async function getParentDetail(id: string, former = false): Promise<ParentDetail> {
  const { data } = await apiClient.get<ParentDetail>(PARENT_ENDPOINTS.DETAIL(id), {
    params: former ? { is_parent: false } : undefined,
  });
  return data;
}

// add_students. Clears is_parent only; the profile and child links stay as
// history. Re-inviting the same email turns them back into a parent.
export async function offboardParent(id: string, reason: string): Promise<MembershipSummary> {
  const { data } = await apiClient.post<MembershipSummary>(PARENT_ENDPOINTS.OFFBOARD(id), { reason });
  return data;
}
