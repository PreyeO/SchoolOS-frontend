import type { Metadata } from "next";

import { MySubjectsPage } from "@/features/student/components/my-subjects-page";

export const metadata: Metadata = { title: "My subjects" };

export default function Page() {
  return <MySubjectsPage />;
}
