import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "Admissions" };

export default function Page() {
  return <ComingSoon href="/admissions" />;
}
