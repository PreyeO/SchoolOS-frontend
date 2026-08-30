import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "Financial Reports" };

export default function Page() {
  return <ComingSoon href="/finance-reports" />;
}
