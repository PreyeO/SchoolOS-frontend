import type { Metadata } from "next";

import { IssueCardsPage } from "@/features/scratch-cards/components/issue/issue-cards-page";

export const metadata: Metadata = { title: "Issue Result Cards" };

// Resolves to the Result Cards nav item by prefix, so it's gated on
// manage_scratch_cards like the rest of /scratch-cards.
export default function Page() {
  return <IssueCardsPage />;
}
