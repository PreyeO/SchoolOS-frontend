import type { Metadata } from "next";

import { SchoolsListPage } from "@/features/platform/components/schools-list-page";

export const metadata: Metadata = { title: "Schools" };

export default function Page() {
  return <SchoolsListPage />;
}
