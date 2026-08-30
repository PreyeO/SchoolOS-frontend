import type { Metadata } from "next";

import { SubjectsPage } from "@/features/settings/components/subjects-page";

export const metadata: Metadata = { title: "Subjects" };

export default function Page() {
  return <SubjectsPage />;
}
