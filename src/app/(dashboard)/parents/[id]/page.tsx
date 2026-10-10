import type { Metadata } from "next";

import { ParentDetailPage } from "@/features/parents/components/parent-detail-page";

export const metadata: Metadata = { title: "Parent profile" };

// ?former=1 marks an offboarded parent, whose detail 404s unless the request
// carries ?is_parent=false. Set by the Former parents list and by a student's
// "Former parent" link. Read server-side, same as the fees and attendance
// routes, to avoid a Suspense boundary.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ former?: string }>;
}) {
  const { id } = await params;
  const { former } = await searchParams;
  return <ParentDetailPage id={id} former={former === "1"} />;
}
