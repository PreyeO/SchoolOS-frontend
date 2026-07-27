import type { Metadata } from "next";

import { SessionsPage } from "@/features/settings/components/sessions-page";

export const metadata: Metadata = { title: "Sessions & Terms — SchoolOS" };

export default function Page() {
  return <SessionsPage />;
}
