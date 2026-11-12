import type { Metadata } from "next";

import { SchoolActivityPage } from "@/features/platform/components/school-activity-page";

export const metadata: Metadata = { title: "School activity" };

export default function Page() {
  return <SchoolActivityPage />;
}
