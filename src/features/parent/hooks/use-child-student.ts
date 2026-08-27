"use client";

import { useStudentLedger } from "@/features/fees/hooks/use-student-ledger";
import { useReportCard } from "@/features/results/hooks/use-report-card";
import type { StudentListItem } from "@/features/students/types";

// The child's own student record — photo, class, gender, enrolment status.
//
// A parent cannot call GET /api/students/<id>/ for this: StudentProfileViewSet
// gates list/retrieve on CanViewStudents (admin with view_students, or any
// teacher), so it 403s for a parent even for their own child. But both
// endpoints a parent MAY read nest the same StudentListItem, so the record
// arrives either way.
//
// The report card is checked as well as the ledger because either can be
// unavailable on its own: the report card 403s before the arm is published,
// and the ledger comes back with is_billed false (but still a student) when
// there's no enrolment for the period. Whichever resolved is used.
//
// Both hooks share their query keys with the screens that render the actual
// results and fees, so this adds no requests of its own.
export function useChildStudent(
  studentId: string | undefined,
  periodId: string | null,
): { student: StudentListItem | undefined; isPending: boolean } {
  const ledger = useStudentLedger(studentId ?? null, periodId);
  const reportCard = useReportCard(studentId, periodId);

  return {
    student: ledger.data?.student ?? reportCard.data?.student,
    // Settled once either has answered — waiting on the other would stall the
    // header behind a query that may legitimately never succeed.
    isPending: ledger.isPending && reportCard.isPending,
  };
}
