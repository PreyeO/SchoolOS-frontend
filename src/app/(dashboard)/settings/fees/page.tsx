import type { Metadata } from "next";

import { FeeItemsPage } from "@/features/fees/components/fee-items-page";

export const metadata: Metadata = { title: "Fee Structure" };

export default function Page() {
  return <FeeItemsPage />;
}
