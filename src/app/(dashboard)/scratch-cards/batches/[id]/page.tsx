import type { Metadata } from "next";

import { BatchDetailPage } from "@/features/scratch-cards/components/sent/batch-detail-page";

export const metadata: Metadata = { title: "Result Card Send" };

// Under /scratch-cards, so the nav registry gates it on manage_scratch_cards.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BatchDetailPage id={id} />;
}
