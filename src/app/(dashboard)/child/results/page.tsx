import type { Metadata } from "next";

import { ChildResultsPage } from "@/features/parent/components/child-results-page";

export const metadata: Metadata = { title: "Results" };

export default function Page() {
  return <ChildResultsPage />;
}
