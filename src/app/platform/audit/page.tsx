import type { Metadata } from "next";

import { PlatformAuditPage } from "@/features/platform/components/platform-audit-page";

export const metadata: Metadata = { title: "Audit log — SchoolOS" };

export default function Page() {
  return <PlatformAuditPage />;
}
