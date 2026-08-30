import type { Metadata } from "next";

import { StudentDetailPage } from "@/features/students/components/student-detail-page";

export const metadata: Metadata = { title: "Student profile" };

// The same detail screen the admin directory uses, on a teacher-reachable path.
//
// /students is admin-only in the nav registry, and that item governs
// /students/<id> too (longest-prefix match), so a teacher can't be let into the
// detail page without also opening the school-wide directory. A second route
// keeps the two audiences separate. The component itself already handles a
// teacher correctly — useCanEditStudent mirrors CanEditStudentProfile, which
// admits any teacher.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentDetailPage id={id} />;
}
