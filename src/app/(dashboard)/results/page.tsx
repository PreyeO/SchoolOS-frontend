import type { Metadata } from "next";

import { ScoreEntryPage } from "@/features/results/components/score-entry-page";

export const metadata: Metadata = { title: "Score entry" };

export default function Page() {
  return <ScoreEntryPage />;
}
