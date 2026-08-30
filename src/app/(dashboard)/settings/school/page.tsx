import type { Metadata } from "next";

import { SchoolProfilePage } from "@/features/settings/components/school-profile-page";

export const metadata: Metadata = { title: "School Profile" };

export default function Page() {
  return <SchoolProfilePage />;
}
