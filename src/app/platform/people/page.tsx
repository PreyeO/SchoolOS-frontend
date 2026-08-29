import type { Metadata } from "next";

import { PlatformPeoplePage } from "@/features/platform/components/people-page";

export const metadata: Metadata = { title: "Directory — SchoolOS" };

export default function Page() {
  return <PlatformPeoplePage />;
}
