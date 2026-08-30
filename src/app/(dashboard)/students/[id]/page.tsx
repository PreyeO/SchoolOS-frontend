import type { Metadata } from "next";

import { StudentDetailPage } from "@/features/students/components/student-detail-page";

export const metadata: Metadata = { title: "Student profile" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentDetailPage id={id} />;
}
