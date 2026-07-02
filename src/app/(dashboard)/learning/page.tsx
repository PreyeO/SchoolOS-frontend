import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "Learning / Content — SchoolOS" };

export default function Page() {
  return <ComingSoon href="/learning" />;
}
