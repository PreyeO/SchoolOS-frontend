import type { Metadata } from "next";

import { TeachingAssignmentsPage } from "@/features/teaching-assignments/components/teaching-assignments-page";

export const metadata: Metadata = { title: "Teaching Assignments" };

export default function Page() {
  return <TeachingAssignmentsPage />;
}
