import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "Visitors & Gate" };

export default function Page() {
  return <ComingSoon href="/visitors" />;
}
