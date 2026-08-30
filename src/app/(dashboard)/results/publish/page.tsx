import type { Metadata } from "next";

import { PublishResultsPage } from "@/features/results/components/publish-results-page";

export const metadata: Metadata = { title: "Publish results" };

export default function Page() {
  return <PublishResultsPage />;
}
