import type { Metadata } from "next";

import { BatchDetailPage } from "@/features/scratch-cards/components/sent/batch-detail-page";
import { parseBatchOrigin } from "@/features/scratch-cards/lib/batch-back-link";

export const metadata: Metadata = { title: "Result Card Send" };

// Under /scratch-cards, so the nav registry gates it on manage_scratch_cards.
// ?from=records | ?from=student&student=… decides where "back" goes.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const raw = await searchParams;
  const one = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : undefined);
  return <BatchDetailPage id={id} origin={parseBatchOrigin(one("from"), one("student"))} />;
}
