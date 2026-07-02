import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "Announcements — SchoolOS" };

export default function Page() {
  return <ComingSoon href="/announcements" />;
}
