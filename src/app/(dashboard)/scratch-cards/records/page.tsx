import type { Metadata } from "next";

import { RecordsPage } from "@/features/scratch-cards/components/records-page";
import { RECORD_TABS, type RecordTab } from "@/features/scratch-cards/lib/record-tabs";

export const metadata: Metadata = { title: "Result Card Records" };

// Under /scratch-cards, so the nav registry gates it on manage_scratch_cards
// and highlights Result Cards. ?tab=sends|numbers|cards|purchases.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams).tab;
  const tab = RECORD_TABS.find((t) => t === raw) as RecordTab | undefined;
  return <RecordsPage tab={tab} />;
}
