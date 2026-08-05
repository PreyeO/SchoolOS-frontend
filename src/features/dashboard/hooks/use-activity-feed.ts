"use client";

import { useQuery } from "@tanstack/react-query";

import { getSchoolId } from "@/lib/school/get-school-id";
import { formatRelativeTime } from "@/lib/text/format-relative-time";

import { getAuditLogs } from "../api/audit-log-api";
import { formatAuditEntry } from "../lib/format-audit-entry";

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
}

export function useActivityFeed() {
  const schoolId = getSchoolId();

  return useQuery({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: () => getAuditLogs(),
    enabled: !!schoolId,
    select: (entries): ActivityItem[] =>
      entries.map((entry) => ({
        id: entry.id,
        text: formatAuditEntry(entry),
        timestamp: formatRelativeTime(entry.created_at),
      })),
  });
}
