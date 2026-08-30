import type { Metadata } from "next";

import { ClassArmDetailPage } from "@/features/settings/components/class-arm-detail-page";

export const metadata: Metadata = { title: "Class" };

export default async function Page({ params }: { params: Promise<{ armId: string }> }) {
  const { armId } = await params;
  return <ClassArmDetailPage armId={armId} />;
}
