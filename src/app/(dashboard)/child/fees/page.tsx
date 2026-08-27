import type { Metadata } from "next";

import { ChildFeesPage } from "@/features/parent/components/child-fees-page";

export const metadata: Metadata = { title: "Fees — SchoolOS" };

export default function Page() {
  return <ChildFeesPage />;
}
