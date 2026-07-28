import type { Metadata } from "next";

import { ParentsListPage } from "@/features/parents/components/parents-list-page";

export const metadata: Metadata = { title: "Parents & Guardians — SchoolOS" };

export default function Page() {
  return <ParentsListPage />;
}
