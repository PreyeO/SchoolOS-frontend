import type { Metadata } from "next";

import { AdminsListPage } from "@/features/admins/components/admins-list-page";

export const metadata: Metadata = { title: "School Admins — SchoolOS" };

export default function Page() {
  return <AdminsListPage />;
}
