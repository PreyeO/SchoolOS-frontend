import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "Attendance — SchoolOS" };

// Not an unbuilt screen — an unavailable one. AttendanceRecordViewSet's
// queryset returns no rows to a parent (a silent empty 200, not a 403) and
// there's no per-student filter, so there is nothing a screen here could show.
// See docs/PROJECT.md's backend-gap list.
export default function Page() {
  return <ComingSoon href="/child/attendance" />;
}
