import type { Metadata } from "next";

import { AuditLogPage } from "@/features/audit-logs/components/audit-log-page";

export const metadata: Metadata = { title: "Audit Log — SchoolOS" };

export default function Page() {
  return <AuditLogPage />;
}
