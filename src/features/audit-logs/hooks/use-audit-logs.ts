"use client";

import { useQuery } from "@tanstack/react-query";

import { getSchoolId } from "@/lib/school/get-school-id";

import { getAuditLogs } from "../api/audit-logs-api";
import type { AuditLogFilters } from "../types";

export function useAuditLogs(filters: AuditLogFilters) {
  const schoolId = getSchoolId();

  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => getAuditLogs(filters),
    enabled: !!schoolId,
  });
}

// The same log, read cross-school by a platform admin.
//
// Identical query — /api/audit-logs/ takes no school parameter and the backend
// scopes it by who is asking, returning every school's entries for a platform
// admin. The ONLY difference is dropping the `enabled: !!schoolId` gate: a
// platform admin's token carries no school_id by design, so the school-side
// hook would never fire for them.
//
// A separate key prefix so the two never share a cache entry — the same
// filters mean "this school" to one caller and "all schools" to the other.
export function usePlatformAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: ["platform", "audit-logs", filters],
    queryFn: () => getAuditLogs(filters),
  });
}
