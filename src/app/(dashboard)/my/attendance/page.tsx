import type { Metadata } from "next";

import { MyAttendancePage } from "@/features/student/components/my-attendance-page";

export const metadata: Metadata = { title: "My attendance" };

export default function Page() {
  return <MyAttendancePage />;
}
