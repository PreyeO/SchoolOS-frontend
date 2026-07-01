import type { Metadata } from "next";

import { DashboardWelcome } from "@/features/dashboard/components/dashboard-welcome";
import { SetupChecklist } from "@/features/dashboard/components/setup-checklist";

export const metadata: Metadata = { title: "Dashboard — SchoolOS" };

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <DashboardWelcome />
      <SetupChecklist />
    </div>
  );
}
