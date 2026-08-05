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
