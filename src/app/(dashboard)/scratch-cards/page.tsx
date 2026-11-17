import type { Metadata } from "next";

import { ScratchCardsPage } from "@/features/scratch-cards/components/scratch-cards-page";

export const metadata: Metadata = { title: "Result Cards" };

export default function Page() {
  return <ScratchCardsPage />;
}
