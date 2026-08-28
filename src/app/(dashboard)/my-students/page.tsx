import type { Metadata } from "next";

import { MyStudentsPage } from "@/features/teacher/components/my-students-page";

export const metadata: Metadata = { title: "My Students — SchoolOS" };

export default function Page() {
  return <MyStudentsPage />;
}
