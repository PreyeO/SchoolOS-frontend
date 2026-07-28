import type { Metadata } from "next";

import { StaffListPage } from "@/features/staff/components/staff-list-page";

export const metadata: Metadata = { title: "Staff — SchoolOS" };

export default function Page() {
  return <StaffListPage />;
}
