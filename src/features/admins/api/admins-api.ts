import { apiClient } from "@/lib/api/client";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { AdminDetail, AdminFilters, AdminListItem } from "../types";

export async function getAdmins(filters: AdminFilters): Promise<PaginatedResponse<AdminListItem>> {
  const { data } = await apiClient.get<PaginatedResponse<AdminListItem>>(ADMIN_ENDPOINTS.LIST(), {
    params: filters,
  });
  return data;
}

export async function getAdminDetail(id: string): Promise<AdminDetail> {
  const { data } = await apiClient.get<AdminDetail>(ADMIN_ENDPOINTS.DETAIL(id));
  return data;
}

export async function assignRole(id: string, roleId: string): Promise<AdminDetail> {
  const { data } = await apiClient.post<AdminDetail>(ADMIN_ENDPOINTS.ASSIGN_ROLE(id), { role_id: roleId });
  return data;
}

export async function unassignRole(id: string): Promise<AdminDetail> {
  const { data } = await apiClient.post<AdminDetail>(ADMIN_ENDPOINTS.UNASSIGN_ROLE(id));
  return data;
}
