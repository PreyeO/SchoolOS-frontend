import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "Hostel & Boarding" };

export default function Page() {
  return <ComingSoon href="/hostel" />;
}
