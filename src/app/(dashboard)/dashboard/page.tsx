import type { Metadata } from "next";

import { DashboardHome } from "@/features/dashboard/components/dashboard-home";

export const metadata: Metadata = { title: "Dashboard — SchoolOS" };

export default function DashboardPage() {
  return <DashboardHome />;
}
