import type { Metadata } from "next";

import { ChildFeesPage } from "@/features/parent/components/child-fees-page";

export const metadata: Metadata = { title: "Fees" };

export default function Page() {
  return <ChildFeesPage />;
}
