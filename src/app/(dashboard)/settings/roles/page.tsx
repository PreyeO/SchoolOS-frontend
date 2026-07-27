import type { Metadata } from "next";

import { RolesPage } from "@/features/settings/components/roles-page";

export const metadata: Metadata = { title: "Roles & Permissions — SchoolOS" };

export default function Page() {
  return <RolesPage />;
}
