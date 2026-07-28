import type { Metadata } from "next";

import { StaffDetailPage } from "@/features/staff/components/staff-detail-page";

export const metadata: Metadata = { title: "Staff profile — SchoolOS" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StaffDetailPage id={id} />;
}
