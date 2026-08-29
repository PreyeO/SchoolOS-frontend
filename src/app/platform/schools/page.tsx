import type { Metadata } from "next";

import { SchoolsListPage } from "@/features/platform/components/schools-list-page";

export const metadata: Metadata = { title: "Schools — SchoolOS" };

export default function Page() {
  return <SchoolsListPage />;
}
