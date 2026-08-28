"use client";

import { useMe } from "@/features/me/hooks/use-me";

// A student's own StudentProfile id, straight from /auth/me/.
//
// This used to derive the id by fetching the student's whole class arm and
// finding the row whose user.id matched theirs — /me carried no id, the JWT
// carries none, and GET /api/students/<id>/ is CanViewStudents-gated, so the
// roster was the only route to it. That worked, but meant downloading every
// classmate's name and email to answer a question about one student.
//
// The backend added `id` to /me's student block on 2026-08-29, so the roster
// fetch is gone and with it that incidental exposure of classmate PII.
//
// Returns undefined for a caller with no student block (any non-student
// persona), which is the same signal the class-arm version gave for a student
// with no enrolment — callers already handle it.
export function useMyStudentId(): { studentId: string | undefined; isPending: boolean } {
  const { data: me, isPending } = useMe();

  return {
    studentId: me?.student?.id,
    isPending,
  };
}
