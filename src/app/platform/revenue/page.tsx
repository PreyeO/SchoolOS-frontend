import type { Metadata } from "next";

import { PlatformRevenuePage } from "@/features/platform/components/revenue-page";

export const metadata: Metadata = { title: "Revenue — SchoolOS" };

export default function Page() {
  return <PlatformRevenuePage />;
}
