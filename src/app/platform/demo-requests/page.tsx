import type { Metadata } from "next";

import { DemoRequestsPage } from "@/features/platform/components/demo-requests-page";

export const metadata: Metadata = { title: "Demo requests" };

export default function Page() {
  return <DemoRequestsPage />;
}
