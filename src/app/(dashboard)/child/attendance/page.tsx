import type { Metadata } from "next";

import { ChildAttendancePage } from "@/features/parent/components/child-attendance-page";

export const metadata: Metadata = { title: "Attendance — SchoolOS" };

export default function Page() {
  return <ChildAttendancePage />;
}
