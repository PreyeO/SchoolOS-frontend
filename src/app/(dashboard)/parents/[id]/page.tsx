import type { Metadata } from "next";

import { ParentDetailPage } from "@/features/parents/components/parent-detail-page";

export const metadata: Metadata = { title: "Parent profile — SchoolOS" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ParentDetailPage id={id} />;
}
