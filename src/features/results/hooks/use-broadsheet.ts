"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useRoster } from "@/features/attendance/hooks/use-register";
import { useArmSubjects } from "@/features/teaching-assignments/hooks/use-arm-subjects";

import { getBroadsheet } from "../api/report-card-api";
import type { StudentSubjectResult } from "../types";

export const BROADSHEET_QUERY_KEY = ["results", "broadsheet"];

export interface BroadsheetColumn {
  subjectId: string;
  name: string;
  // False when no student in the arm has a score for it yet. Kept as a column
  // anyway — an empty column is the most legible way to show a subject nobody
  // has entered, which is precisely what blocks the lock.
  hasAnyScore: boolean;
}

export interface BroadsheetGridRow {
  studentId: string;
  name: string;
  admissionNumber: string;
  // Keyed by subject id. Absent means no result row for that subject.
  bySubject: Map<string, StudentSubjectResult>;
  total: number | null;
  average: number | null;
  position: number | null;
  // True when the student has no subject results at all. The API omits these
  // students entirely; they're recovered from the roster so a gap is visible
  // rather than invisible.
  isEmpty: boolean;
}

// The arm's term as a grid.
//
// Three sources, because the endpoint alone can't describe the gaps:
//
//   broadsheet  — the scores that exist
//   offerings   — every subject the arm *takes*, which is what the lock
//                 validates against, so a subject with no scores anywhere still
//                 needs a column
//   roster      — every enrolled student, so one with no scores at all still
//                 needs a row
//
// Reading only the broadsheet would quietly hide both kinds of gap, which are
// the two questions this screen exists to answer.
export function useBroadsheet(
  classArmId: string | null | undefined,
  academicPeriodId: string | null | undefined,
) {
  const query = useQuery({
    queryKey: [...BROADSHEET_QUERY_KEY, classArmId, academicPeriodId],
    queryFn: () => getBroadsheet(classArmId as string, academicPeriodId as string),
    enabled: !!classArmId && !!academicPeriodId,
  });

  const { data: offerings } = useArmSubjects(classArmId ?? null);
  const { data: roster } = useRoster(classArmId ?? null);

  const columns: BroadsheetColumn[] = useMemo(() => {
    const scored = new Set<string>();
    (query.data?.rows ?? []).forEach((row) =>
      row.subjects.forEach((s) => scored.add(s.subject)),
    );

    const byId = new Map<string, BroadsheetColumn>();
    // Offerings first — the authoritative list, in its own order.
    (offerings ?? []).forEach((o) =>
      byId.set(o.subject.id, {
        subjectId: o.subject.id,
        name: o.subject.name,
        hasAnyScore: scored.has(o.subject.id),
      }),
    );
    // Then anything with scores that is no longer offered. Removing an offering
    // is refused once scores exist, but a historical term can still carry one,
    // and dropping the column would silently hide real marks.
    (query.data?.rows ?? []).forEach((row) =>
      row.subjects.forEach((s) => {
        if (!byId.has(s.subject)) {
          byId.set(s.subject, { subjectId: s.subject, name: s.subject_name, hasAnyScore: true });
        }
      }),
    );

    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [query.data, offerings]);

  const rows: BroadsheetGridRow[] = useMemo(() => {
    const byStudent = new Map<string, BroadsheetGridRow>();

    (query.data?.rows ?? []).forEach((row) => {
      const bySubject = new Map<string, StudentSubjectResult>();
      row.subjects.forEach((s) => bySubject.set(s.subject, s));
      byStudent.set(row.student.id, {
        studentId: row.student.id,
        name: `${row.student.user.first_name} ${row.student.user.last_name}`,
        admissionNumber: row.student.admission_number,
        bySubject,
        // Server-computed and only present after the lock. Deliberately not
        // recomputed client-side from the subject scores — an average the
        // school hasn't published yet would be a number nobody can defend.
        total: row.summary ? Number(row.summary.total_score) : null,
        average: row.summary ? Number(row.summary.average_score) : null,
        position: row.summary?.position_in_arm ?? null,
        isEmpty: row.subjects.length === 0,
      });
    });

    (roster?.students ?? []).forEach((student) => {
      if (byStudent.has(student.id)) return;
      byStudent.set(student.id, {
        studentId: student.id,
        name: `${student.user.first_name} ${student.user.last_name}`,
        admissionNumber: student.admission_number,
        bySubject: new Map(),
        total: null,
        average: null,
        position: null,
        isEmpty: true,
      });
    });

    // Ranked once published, alphabetical before — the API returns rows in no
    // particular order either way.
    return [...byStudent.values()].sort((a, b) => {
      if (a.position !== null && b.position !== null) return a.position - b.position;
      if (a.position !== null) return -1;
      if (b.position !== null) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [query.data, roster]);

  const missingScores = useMemo(() => rows.filter((r) => r.isEmpty).length, [rows]);

  return {
    ...query,
    isLocked: query.data?.is_locked ?? false,
    columns,
    rows,
    // How many enrolled students have nothing at all — the headline gap.
    missingScores,
    emptyColumns: columns.filter((c) => !c.hasAnyScore).length,
  };
}
