import type { Metadata } from "next";

import { StudentFeesPage } from "@/features/fees/components/student-fees-page";

export const metadata: Metadata = { title: "Fees & Invoices — SchoolOS" };

export default function Page() {
  return <StudentFeesPage />;
}
