"use client";

import { useQuery } from "@tanstack/react-query";

import { useMe } from "@/features/me/hooks/use-me";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";

import { getOverviewStats } from "../api/dashboard-api";

export function useOverviewStats() {
  const { isPending: mePending } = useMe();
  const viewStudents = useHasSchoolPermission("view_students");
  const viewStaff = useHasSchoolPermission("view_staff");
  const viewAttendance = useHasSchoolPermission("view_attendance");
  const viewAnalytics = useHasSchoolPermission("view_analytics");
  const permissions = { viewStudents, viewStaff, viewAttendance, viewAnalytics };

  return useQuery({
    queryKey: ["dashboard", "overview-stats", permissions],
    queryFn: () => getOverviewStats(permissions),
    // useHasSchoolPermission reads false while /me is still loading, same as
    // "genuinely doesn't hold it" — waiting here means the flags above are
    // already correct on the very first fetch, rather than fetching once with
    // everything false and again once /me lands.
    enabled: !mePending,
  });
}
