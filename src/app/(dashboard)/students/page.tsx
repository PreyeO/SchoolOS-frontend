import type { Metadata } from "next";

import { StudentsListPage } from "@/features/students/components/students-list-page";

export const metadata: Metadata = { title: "Students — SchoolOS" };

export default function Page() {
  return <StudentsListPage />;
}
