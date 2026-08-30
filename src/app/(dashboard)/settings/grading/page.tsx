import type { Metadata } from "next";

import { GradingPage } from "@/features/settings/components/grading-page";

export const metadata: Metadata = { title: "Grading" };

export default function Page() {
  return <GradingPage />;
}
