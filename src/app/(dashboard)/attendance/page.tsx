import type { Metadata } from "next";

import { AttendancePage } from "@/features/attendance/components/attendance-page";

export const metadata: Metadata = { title: "Attendance" };

// ?arm= and ?date= say which register is open. Both are read here rather than
// with useSearchParams, which is the same server-side pattern the invitations
// route uses and avoids needing a Suspense boundary.
//
// The date belongs in the URL because it decides *what a save writes to*. Held
// only in component state it reset to today on every refresh — so a teacher
// correcting Friday's register, who reloaded for any reason, would carry on
// marking and silently write those marks to today instead.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ arm?: string; date?: string }>;
}) {
  const { arm, date } = await searchParams;

  return <AttendancePage initialArmId={arm} initialDate={date} />;
}
