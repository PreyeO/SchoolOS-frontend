import type { Metadata } from "next";

import { PromotionPage } from "@/features/promotion/components/promotion-page";

export const metadata: Metadata = { title: "Promotion" };

export default function Page() {
  return <PromotionPage />;
}
