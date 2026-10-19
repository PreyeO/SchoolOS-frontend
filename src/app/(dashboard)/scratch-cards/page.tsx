import type { Metadata } from "next";

import { ScratchCardsPage } from "@/features/scratch-cards/components/scratch-cards-page";

export const metadata: Metadata = { title: "Result PINs" };

export default function Page() {
  return <ScratchCardsPage />;
}
