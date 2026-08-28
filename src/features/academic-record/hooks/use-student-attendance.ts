"use client";

import { useQuery } from "@tanstack/react-query";

import type { AttendanceStatus } from "@/features/attendance/types";

import { getStudentAttendance } from "../api/student-attendance-api";

// Statuses that count as "in school". Mirrors PRESENT_STATUSES in
// features/teacher/lib/attendance-derivations — late is present (they turned
// up), excused is not (they were absent, with a reason).
const PRESENT: ReadonlySet<AttendanceStatus> = new Set(["present", "late"]);

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  // Null rather than 0 when nothing is marked — "no register taken" and "was
  // never in school" are opposite facts, and a 0% would state the second.
  rate: number | null;
}

export function useStudentAttendance(
  studentId: string | undefined,
  range?: { after?: string; before?: string },
) {
  const query = useQuery({
    queryKey: ["attendance", "student", studentId, range?.after, range?.before],
    queryFn: () => getStudentAttendance(studentId as string, range),
    enabled: !!studentId,
  });

  const records = query.data ?? [];
  const counts = records.reduce(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {} as Record<AttendanceStatus, number>,
  );

  const summary: AttendanceSummary = {
    total: records.length,
    present: counts.present ?? 0,
    absent: counts.absent ?? 0,
    late: counts.late ?? 0,
    excused: counts.excused ?? 0,
    rate:
      records.length === 0
        ? null
        : Math.round((records.filter((r) => PRESENT.has(r.status)).length / records.length) * 100),
  };

  return { ...query, records, summary };
}
