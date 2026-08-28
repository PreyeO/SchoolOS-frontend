"use client";

import { useClassArmDetail } from "@/features/settings/hooks/use-class-arm-detail";
import { useMe } from "@/features/me/hooks/use-me";

// A student's own StudentProfile id — which nothing hands them directly.
//
// /auth/me/'s `student` block carries only current_class and parent_links (no
// id), the JWT carries user_id/membership_id but no profile id, and
// GET /api/students/<id>/ is gated on CanViewStudents so they can't look
// themselves up. Yet /students/<id>/fees/ and /report-card/ both have working
// self-access branches — they just need an id to be called with.
//
// So it's derived: /me gives the caller's user.id and their current class arm,
// and GET /api/class-arms/<arm>/ (which a student MAY read — verified live,
// 200) returns the arm's roster with each student's profile id beside their
// user id. Matching on user.id yields the caller's own profile id. The roster
// is neither capped nor paginated (AcademicService.get_class_arm_detail), so
// this holds for a class of any size.
//
// The cost is real and worth stating: finding yourself means fetching every
// classmate's name and email. Nothing is shown from that list — only the
// caller's own row is read — but the request happens, and it is the reason
// "add `id` to /me's student block" is worth doing on the backend. See
// docs/asks/parent-portal-gaps.md.
//
// Returns undefined for a student with no current enrolment: there's no arm to
// look in, and nothing downstream can be fetched for them anyway.
export function useMyStudentId(): { studentId: string | undefined; isPending: boolean } {
  const { data: me, isPending: meLoading } = useMe();

  const myUserId = me?.user.id;
  const armId = me?.student?.current_class?.class_arm_id ?? null;
  const { data: arm, isPending: armLoading } = useClassArmDetail(armId);

  const studentId = arm?.students.find((s) => s.user.id === myUserId)?.id;

  return {
    studentId,
    // Not pending once we know there's no arm to search — that's a settled
    // answer (unenrolled), not a load still in flight.
    isPending: meLoading || (!!armId && armLoading),
  };
}
