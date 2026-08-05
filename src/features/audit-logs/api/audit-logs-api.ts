import { apiClient } from "@/lib/api/client";
import { AUDIT_LOG_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { AuditLogEntry, AuditLogFilters } from "../types";

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<PaginatedResponse<AuditLogEntry>> {
  const { data } = await apiClient.get<PaginatedResponse<AuditLogEntry>>(AUDIT_LOG_ENDPOINTS.LIST(), {
    params: filters,
  });
  return data;
}

// The model's default ordering is already -created_at, so the first `limit`
// results are exactly the most recent entries — no sort param needed. Used by
// the dashboard home's Recent Activity widget.
export async function getRecentAuditLogs(limit = 5): Promise<AuditLogEntry[]> {
  const { results } = await getAuditLogs({ page_size: limit });
  return results;
}
