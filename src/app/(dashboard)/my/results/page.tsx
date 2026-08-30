import type { Metadata } from "next";

import { MyResultsPage } from "@/features/student/components/my-results-page";

export const metadata: Metadata = { title: "My results" };

export default function Page() {
  return <MyResultsPage />;
}
