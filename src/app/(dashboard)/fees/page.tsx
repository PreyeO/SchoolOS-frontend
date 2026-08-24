import type { Metadata } from "next";

import { StudentFeesPage } from "@/features/fees/components/student-fees-page";

export const metadata: Metadata = { title: "Fees & Invoices — SchoolOS" };

// ?student= and ?period= say whose ledger is open — set by the Payments
// arrears list's "click a name to see their breakdown" link, and kept in sync
// by the page itself afterwards (see student-fees-page.tsx) so a refresh
// returns to whoever is actually being looked at. Read server-side rather than
// with useSearchParams, same pattern the attendance and invitations routes use
// to avoid a Suspense boundary.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; period?: string }>;
}) {
  const { student, period } = await searchParams;

  return <StudentFeesPage initialStudentId={student} initialPeriodId={period} />;
}
