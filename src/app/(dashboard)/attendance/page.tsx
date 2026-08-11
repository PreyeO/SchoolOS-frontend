import type { Metadata } from "next";

import { AttendancePage } from "@/features/attendance/components/attendance-page";

export const metadata: Metadata = { title: "Attendance — SchoolOS" };

// ?arm= preselects a class arm, so "Take register" on a specific class in My
// Classes or the teacher dashboard lands on that register rather than whichever
// arm happens to sort first. Read server-side — the same searchParams pattern
// the invitations route uses, which avoids needing a Suspense boundary.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ arm?: string }>;
}) {
  const { arm } = await searchParams;

  return <AttendancePage initialArmId={arm} />;
}
