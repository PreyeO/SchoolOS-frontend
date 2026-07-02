import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "Results & Report Cards — SchoolOS" };

export default function Page() {
  return <ComingSoon href="/results" />;
}
