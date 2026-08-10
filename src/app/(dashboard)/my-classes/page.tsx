import type { Metadata } from "next";

import { MyClassesPage } from "@/features/teacher/components/my-classes-page";

export const metadata: Metadata = { title: "My Classes — SchoolOS" };

export default function Page() {
  return <MyClassesPage />;
}
