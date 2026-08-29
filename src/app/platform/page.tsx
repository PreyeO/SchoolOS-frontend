import type { Metadata } from "next";

import { PlatformOverview } from "@/features/platform/components/platform-overview";

export const metadata: Metadata = { title: "Platform — SchoolOS" };

export default function Page() {
  return <PlatformOverview />;
}
