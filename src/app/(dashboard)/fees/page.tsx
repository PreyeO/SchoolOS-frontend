import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "Fees & Invoices — SchoolOS" };

export default function Page() {
  return <ComingSoon href="/fees" />;
}
