import type { Metadata } from "next";

import { ReportCardSettingsPage } from "@/features/results/components/report-card-settings-page";

export const metadata: Metadata = { title: "Report card design" };

export default function Page() {
  return <ReportCardSettingsPage />;
}
