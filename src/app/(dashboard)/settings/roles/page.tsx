import type { Metadata } from "next";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "Roles & Permissions — SchoolOS" };

export default function Page() {
  return <ComingSoon href="/settings/roles" />;
}
