import { apiClient } from "@/lib/api/client";
import { ADMIN_ENDPOINTS, PARENT_ENDPOINTS, PILOT_ENDPOINTS, TEACHER_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { DemoRequestStatus } from "../types-demo-requests";

// Platform-wide totals for the overview, read off the existing list routes:
// as a platform admin each returns every school's rows, so `count` on a
// page_size=1 request is the platform total. There is no stats endpoint —
// see the backend ask in PROJECT.md.
//
// Each count is null when it can't be read, never 0. The routes are gated by
// separate platform permissions (view_platform_staff, view_platform_parents,
// view_platform_demo_requests), so one staff member may see teachers but not
// parents, and a 403 must not read as "nobody".
async function count(url: string, params: Record<string, unknown> = {}): Promise<number> {
  const { data } = await apiClient.get<PaginatedResponse<unknown>>(url, { params: { ...params, page_size: 1 } });
  return data.count;
}

async function settle(promise: Promise<number>): Promise<number | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

export interface PlatformHeadcounts {
  teachers: number | null;
  parents: number | null;
  admins: number | null;
}

// is_active=true on all three: a deactivated membership (offboarded down to
// no persona) can't sign in and isn't someone "using the product". Teachers
// and admins offboarded are deleted outright; parents default to current
// parents only.
export async function getPlatformHeadcounts(): Promise<PlatformHeadcounts> {
  const [teachers, parents, admins] = await Promise.all([
    settle(count(TEACHER_ENDPOINTS.LIST(), { is_active: true })),
    settle(count(PARENT_ENDPOINTS.LIST(), { is_active: true })),
    settle(count(ADMIN_ENDPOINTS.LIST(), { is_active: true })),
  ]);
  return { teachers, parents, admins };
}

export type DemoPipeline = Record<DemoRequestStatus, number> | null;

// One count per status. All-or-nothing: the four share one permission, so
// they fail together and the card shows its no-access state.
export async function getDemoPipeline(): Promise<DemoPipeline> {
  const statuses: DemoRequestStatus[] = ["pending", "contacted", "converted", "declined"];
  try {
    const counts = await Promise.all(statuses.map((status) => count(PILOT_ENDPOINTS.DEMO_REQUEST, { status })));
    return Object.fromEntries(statuses.map((s, i) => [s, counts[i]])) as Record<DemoRequestStatus, number>;
  } catch {
    return null;
  }
}
