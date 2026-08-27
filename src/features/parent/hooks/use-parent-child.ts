"use client";

import { useMe } from "@/features/me/hooks/use-me";
import type { MeChildLink } from "@/features/me/types";

// Resolves a /my-children/<id> route param against the caller's own linked
// children, so the detail page renders from /me rather than fetching the
// student record — GET /api/students/<id>/ is gated on CanViewStudents
// (admin with view_students, or any teacher) and would 403 for a parent, even
// for their own child.
//
// Matching here also means an id that isn't theirs never reaches the fees or
// report-card endpoints. Those enforce it themselves — both re-check
// ParentStudentLink live on every request — so this is about showing "no such
// child" instead of a permission error, not about being the security boundary.
export function useParentChild(studentId: string): {
  child: MeChildLink | undefined;
  isPending: boolean;
} {
  const { data: me, isPending } = useMe();
  const child = me?.parent?.student_links.find((link) => link.student_id === studentId);

  return { child, isPending };
}
