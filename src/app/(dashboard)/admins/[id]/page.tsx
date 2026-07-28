import type { Metadata } from "next";

import { AdminDetailPage } from "@/features/admins/components/admin-detail-page";

export const metadata: Metadata = { title: "Admin profile — SchoolOS" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminDetailPage id={id} />;
}
