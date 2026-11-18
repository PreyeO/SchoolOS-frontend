import type { Metadata } from "next";

import { ReviewQueuePage } from "@/features/results/components/review-queue-page";
import { parseStatusFilter } from "@/features/results/lib/review-queue-filter";

export const metadata: Metadata = { title: "Result review" };

// ?status= opens the queue filtered to one status, set by the dashboard's
// "Results this term" rows. Read here rather than with useSearchParams, the
// same server-side pattern the broadsheet and attendance routes use to avoid a
// Suspense boundary.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return <ReviewQueuePage initialStatus={parseStatusFilter(status)} />;
}
