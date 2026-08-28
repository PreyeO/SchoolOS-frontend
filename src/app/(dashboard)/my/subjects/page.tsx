import type { Metadata } from "next";

import { MySubjectsPage } from "@/features/student/components/my-subjects-page";

export const metadata: Metadata = { title: "My subjects — SchoolOS" };

export default function Page() {
  return <MySubjectsPage />;
}
