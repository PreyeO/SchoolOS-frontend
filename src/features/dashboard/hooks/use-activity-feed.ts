"use client";

import { useQuery } from "@tanstack/react-query";

import { getRecentAuditLogs } from "@/features/audit-logs/api/audit-logs-api";
import { formatAuditEntry } from "@/features/audit-logs/lib/format-audit-entry";
import { getSchoolId } from "@/lib/school/get-school-id";
import { formatRelativeTime } from "@/lib/text/format-relative-time";

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
}

// The dashboard widget is a 5-entry summary of the same data the full
// /settings/audit-log screen shows — it cross-imports from features/audit-logs
// rather than keeping its own copy of the ~39-action sentence catalog.
export function useActivityFeed() {
  const schoolId = getSchoolId();

  return useQuery({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: () => getRecentAuditLogs(),
    enabled: !!schoolId,
    select: (entries): ActivityItem[] =>
      entries.map((entry) => ({
        id: entry.id,
        text: formatAuditEntry(entry),
        timestamp: formatRelativeTime(entry.created_at),
      })),
  });
}
