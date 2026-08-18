import type { Metadata } from "next";

import { BroadsheetPage } from "@/features/results/components/broadsheet-page";

export const metadata: Metadata = { title: "Broadsheet — SchoolOS" };

export default function Page() {
  return <BroadsheetPage />;
}
