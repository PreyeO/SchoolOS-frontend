import type { Metadata } from "next";

import { GradingPage } from "@/features/settings/components/grading-page";

export const metadata: Metadata = { title: "Grading — SchoolOS" };

export default function Page() {
  return <GradingPage />;
}
