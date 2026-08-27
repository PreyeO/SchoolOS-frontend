import type { Metadata } from "next";

import { ChildDetailPage } from "@/features/parent/components/child-detail-page";

export const metadata: Metadata = { title: "My child — SchoolOS" };

export default async function Page({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  return <ChildDetailPage studentId={studentId} />;
}
