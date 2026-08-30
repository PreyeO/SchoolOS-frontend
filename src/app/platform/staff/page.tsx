import type { Metadata } from "next";

import { PlatformStaffPage } from "@/features/platform/components/staff-page";

export const metadata: Metadata = { title: "SchoolOS staff" };

export default function Page() {
  return <PlatformStaffPage />;
}
