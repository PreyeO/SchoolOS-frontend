import { apiClient } from "@/lib/api/client";
import { PLATFORM_ADMIN_ENDPOINTS, SCHOOL_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { SchoolDetailResponse } from "@/lib/school/get-school-detail";

import type {
  ExtendAccessPayload,
  PlatformAdmin,
  PlatformFinancials,
  PlatformSchool,
} from "../types";

// Every school on the platform. SchoolViewSet.get_queryset returns all schools
// for a platform admin and only the caller's own memberships otherwise, so the
// same URL means something different depending on who asks — this module is
// only ever called from the platform panel.
//
// page_size=100 with no pagination UI: pilot-scale. Revisit before the school
// count approaches that.
export async function getPlatformSchools(search?: string): Promise<PlatformSchool[]> {
  const { data } = await apiClient.get<PaginatedResponse<PlatformSchool>>(
    SCHOOL_ENDPOINTS.LIST(),
    { params: { page_size: 100, ...(search ? { search } : {}) } },
  );
  return data.results;
}

// The detail route, which unlike the list DOES carry billing fields for a
// platform admin (_user_can_see_billing returns true for them unconditionally).
export async function getPlatformSchool(id: string): Promise<SchoolDetailResponse> {
  const { data } = await apiClient.get<SchoolDetailResponse>(SCHOOL_ENDPOINTS.DETAIL(id));
  return data;
}

export async function getPlatformFinancials(): Promise<PlatformFinancials> {
  const { data } = await apiClient.get<PlatformFinancials>(SCHOOL_ENDPOINTS.FINANCIALS());
  return data;
}

export async function getPlatformAdmins(): Promise<PlatformAdmin[]> {
  const { data } = await apiClient.get<PaginatedResponse<PlatformAdmin>>(
    PLATFORM_ADMIN_ENDPOINTS.LIST(),
    { params: { page_size: 100 } },
  );
  return data.results;
}

// Returns the updated school WITH billing, so the caller can render the new
// access state without a refetch.
export async function extendSchoolAccess(
  id: string,
  payload: ExtendAccessPayload,
): Promise<SchoolDetailResponse> {
  const { data } = await apiClient.post<SchoolDetailResponse>(
    SCHOOL_ENDPOINTS.EXTEND_ACCESS(id),
    payload,
  );
  return data;
}
