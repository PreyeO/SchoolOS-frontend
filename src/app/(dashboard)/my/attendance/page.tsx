import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "My attendance — SchoolOS" };

// Not unbuilt — unavailable. AttendanceRecordViewSet returns an empty queryset
// to a student (a silent 200, not a 403) and has no per-student filter, so
// there is nothing a screen here could show. See docs/asks/parent-portal-gaps.md.
export default function Page() {
  return <ComingSoon href="/my/attendance" />;
}
