import type { Metadata } from "next";

import { ClassesPage } from "@/features/settings/components/classes-page";

export const metadata: Metadata = { title: "Classes & Arms" };

export default function Page() {
  return <ClassesPage />;
}
