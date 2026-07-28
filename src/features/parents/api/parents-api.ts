import { apiClient } from "@/lib/api/client";
import { PARENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { ParentDetail, ParentFilters, ParentListItem } from "../types";

export async function getParents(filters: ParentFilters): Promise<PaginatedResponse<ParentListItem>> {
  const { data } = await apiClient.get<PaginatedResponse<ParentListItem>>(PARENT_ENDPOINTS.LIST(), {
    params: filters,
  });
  return data;
}

export async function getParentDetail(id: string): Promise<ParentDetail> {
  const { data } = await apiClient.get<ParentDetail>(PARENT_ENDPOINTS.DETAIL(id));
  return data;
}
