import type { Metadata } from "next";

import { SessionsPage } from "@/features/settings/components/sessions-page";

export const metadata: Metadata = { title: "Sessions & Terms" };

export default function Page() {
  return <SessionsPage />;
}
