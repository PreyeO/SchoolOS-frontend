import { apiClient } from "@/lib/api/client";
import { PILOT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { DemoRequest, DemoRequestFilters, DemoRequestStatus } from "../types-demo-requests";

// Same path the public form POSTs to, read here as a platform admin. The
// backend serves both from one viewset with different permissions per action.
//
// page_size=100 with no pagination UI, matching the other platform lists: at
// pilot scale the whole queue fits on a screen, and an admin working a lead
// list wants to see it, not page through it. Revisit if leads pass 100.
export async function getDemoRequests(filters: DemoRequestFilters): Promise<DemoRequest[]> {
  const { data } = await apiClient.get<PaginatedResponse<DemoRequest>>(
    PILOT_ENDPOINTS.DEMO_REQUEST,
    {
      // Only non-empty values are sent. django-filter silently ignores an
      // unknown param but treats an empty one as a real filter on some field
      // types, so an empty string is never the same as "no filter".
      params: {
        page_size: 100,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.student_range ? { student_range: filters.student_range } : {}),
        ...(filters.state ? { state: filters.state } : {}),
        ...(filters.created_at_after ? { created_at_after: filters.created_at_after } : {}),
        ...(filters.created_at_before ? { created_at_before: filters.created_at_before } : {}),
      },
    },
  );
  return data.results;
}

// PATCH takes only { status }. Sending anything else is silently ignored rather
// than rejected, so this deliberately sends nothing else — a payload the server
// half-ignores is a payload someone will later assume works.
export async function updateDemoRequestStatus(
  id: string,
  status: DemoRequestStatus,
): Promise<DemoRequest> {
  const { data } = await apiClient.patch<DemoRequest>(
    PILOT_ENDPOINTS.DEMO_REQUEST_DETAIL(id),
    { status },
  );
  return data;
}
