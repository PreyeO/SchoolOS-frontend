import type { Metadata } from "next";

import { PlatformSchoolDetailPage } from "@/features/platform/components/school-detail-page";

export const metadata: Metadata = { title: "School" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlatformSchoolDetailPage schoolId={id} />;
}
