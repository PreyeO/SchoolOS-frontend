import type { Metadata } from "next";

import { ReviewQueuePage } from "@/features/results/components/review-queue-page";

export const metadata: Metadata = { title: "Result review — SchoolOS" };

export default function Page() {
  return <ReviewQueuePage />;
}
