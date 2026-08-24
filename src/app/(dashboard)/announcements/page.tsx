import type { Metadata } from "next";

import { AnnouncementsPage } from "@/features/communication/components/announcements-page";

export const metadata: Metadata = { title: "Announcements — SchoolOS" };

export default function Page() {
  return <AnnouncementsPage />;
}
