"use client";

import { useQueries } from "@tanstack/react-query";

import type { AuditLogEntry } from "@/features/audit-logs/types";

import { getLatestSchoolEntries } from "../api/school-activity-api";
import { daysSince, latestSchoolEntry } from "../lib/school-activity";
import type { PlatformSchool } from "../types";
import { usePlatformAdmins, usePlatformSchools } from "./use-platform";

export interface SchoolActivity {
  school: PlatformSchool;
  name: string;
  // null until loaded, or when the school has done nothing itself.
  latest: AuditLogEntry | null;
  days: number | null;
  isPending: boolean;
  isError: boolean;
}

// Every school's last own activity. There is no "last active" field on the
// school, so it's one small audit request per school (see
// getLatestSchoolEntries), fired together and cached for five minutes: this is
// a screen to scan now and then, not a live feed.
export function useSchoolActivity() {
  const schools = usePlatformSchools();
  const admins = usePlatformAdmins();
  const staffIds = new Set((admins.data ?? []).map((a) => a.user.id));

  const entries = useQueries({
    queries: (schools.data ?? []).map((school) => ({
      queryKey: ["platform", "school-activity", school.id],
      queryFn: () => getLatestSchoolEntries(school.id),
      staleTime: 5 * 60_000,
    })),
  });

  const rows: SchoolActivity[] = (schools.data ?? []).map((school, i) => {
    const q = entries[i];
    const latest = q?.data ? latestSchoolEntry(q.data, staffIds) : null;
    return {
      school,
      name: school.name,
      latest,
      days: latest ? daysSince(latest.created_at) : null,
      isPending: !q || q.isPending,
      isError: !!q?.isError,
    };
  });

  return {
    rows,
    // The staff list decides what gets skipped, so rows wait for it too.
    isPending: schools.isPending || admins.isPending,
    isError: schools.isError,
    error: schools.error,
    loaded: rows.filter((r) => !r.isPending).length,
  };
}
