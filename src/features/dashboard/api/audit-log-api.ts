import { apiClient } from "@/lib/api/client";
import { AUDIT_LOG_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { UserMinimal } from "@/lib/api/profile-summary";

export interface AuditLogChange {
  field: string;
  old: unknown;
  new: unknown;
}

// Confirmed against audit/models.py + audit/serializers.py. actor is null for
// system-triggered events; changes is null for create/delete (target_repr
// alone suffices there).
export interface AuditLogEntry {
  id: string;
  actor: UserMinimal | null;
  school: string | null;
  school_name: string | null;
  action: string;
  target_type: string;
  target_id: string;
  target_repr: string;
  changes: AuditLogChange[] | null;
  created_at: string;
}

// Model's default ordering is already -created_at, so the first `limit`
// results are exactly the most recent entries — no extra sort param needed.
export async function getAuditLogs(limit = 8): Promise<AuditLogEntry[]> {
  const { data } = await apiClient.get<PaginatedResponse<AuditLogEntry>>(AUDIT_LOG_ENDPOINTS.LIST(), {
    params: { page_size: limit },
  });
  return data.results;
}
