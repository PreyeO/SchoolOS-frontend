import type { Metadata } from "next";

import { BroadsheetPage } from "@/features/results/components/broadsheet-page";

export const metadata: Metadata = { title: "Broadsheet — SchoolOS" };

// ?arm= and ?period= say which arm and term to open on — set by "View
// broadsheet" links elsewhere (Publish Results is the first). Read here rather
// than with useSearchParams, same server-side pattern the attendance and
// invitations routes use to avoid a Suspense boundary.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ arm?: string; period?: string }>;
}) {
  const { arm, period } = await searchParams;

  return <BroadsheetPage initialArmId={arm} initialPeriodId={period} />;
}
