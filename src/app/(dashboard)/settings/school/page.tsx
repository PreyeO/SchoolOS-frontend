import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "School Profile & Branding — SchoolOS" };

export default function Page() {
  return <ComingSoon href="/settings/school" />;
}
