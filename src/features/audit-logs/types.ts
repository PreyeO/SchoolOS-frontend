import type { UserMinimal } from "@/lib/api/profile-summary";

// audit/utils.py's _to_json_safe keeps primitives, lists, and dicts as real
// JSON and str()-coerces everything else — so a change value can legitimately
// be an array (a role's `permissions` list) and must never be dumped raw.
export type AuditChangeValue = string | number | boolean | null | unknown[] | Record<string, unknown>;

export interface AuditLogChange {
  field: string;
  old: AuditChangeValue;
  new: AuditChangeValue;
}

// Confirmed against audit/models.py + audit/serializers.py. actor is null for
// system-triggered events; changes is null for create/delete actions (where
// target_repr alone suffices) and populated for updates via build_changes().
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

// Only these four are real backend filters (audit/filters.py + SearchFilter).
// Notably there is NO target_type filter and no filter by who was *affected* —
// `search` matches the ACTOR's first_name/last_name/email only.
export interface AuditLogFilters {
  action?: string;
  search?: string;
  created_at_after?: string;
  created_at_before?: string;
  page?: number;
  page_size?: number;
}
