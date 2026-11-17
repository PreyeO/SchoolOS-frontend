import { apiClient } from "@/lib/api/client";
import { AUDIT_LOG_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { AuditLogEntry } from "@/features/audit-logs/types";

// A school's newest audit entries, newest first (the model orders by
// -created_at). `school_id` is a platform-admin-only filter on the shared
// audit route: a school member's list is already pinned to their own school.
//
// Ten, not one, because staff actions on the school (extend trial, wallet
// adjustments) are logged against it too and get skipped by the caller; ten
// leaves room past a burst of those. If all ten are staff, the school reads as
// having no recent activity of its own, which is true enough to act on.
export async function getLatestSchoolEntries(schoolId: string): Promise<AuditLogEntry[]> {
  const { data } = await apiClient.get<PaginatedResponse<AuditLogEntry>>(AUDIT_LOG_ENDPOINTS.LIST(), {
    params: { school_id: schoolId, page_size: 10 },
  });
  return data.results;
}
