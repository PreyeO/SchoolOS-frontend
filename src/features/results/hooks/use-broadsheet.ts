"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

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
  isEmpty: boolean;
}

// The arm's term as a grid.
//
// Rows come straight from the server, in its order. It builds one row per
// *currently enrolled* student — including those with no scores at all, whose
// `subjects` is simply empty — and sorts by admission number, which is also the
// order the bulk report-card PDF prints in. This used to be reconciled here
// against a separate roster request and re-sorted client-side; the backend took
// both jobs on, so that's gone: one request fewer per screen, no 100-student
// page cap, and the sheet on screen matches the sheet that prints.
//
// Columns still need the offerings, though. A subject nobody has scored appears
// in no student's `subjects`, so it would have no column at all — and a subject
// with no marks is exactly what an admin is looking for before publishing.
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

  const columns: BroadsheetColumn[] = useMemo(() => {
    const scored = new Set<string>();
    (query.data?.rows ?? []).forEach((row) => row.subjects.forEach((s) => scored.add(s.subject)));

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

  const rows: BroadsheetGridRow[] = useMemo(
    () =>
      (query.data?.rows ?? []).map((row) => {
        const bySubject = new Map<string, StudentSubjectResult>();
        row.subjects.forEach((s) => bySubject.set(s.subject, s));
        return {
          studentId: row.student.id,
          name: `${row.student.user.first_name} ${row.student.user.last_name}`,
          admissionNumber: row.student.admission_number,
          bySubject,
          // Server-computed and only present after the lock. Deliberately not
          // recomputed client-side from the subject scores — the backend divides
          // by the number of subjects the arm *offers*, not the number scored,
          // so a locally derived average would read high for anyone missing a
          // subject and contradict the printed card.
          total: row.summary ? Number(row.summary.total_score) : null,
          average: row.summary ? Number(row.summary.average_score) : null,
          position: row.summary?.position_in_arm ?? null,
          isEmpty: row.subjects.length === 0,
        };
      }),
    [query.data],
  );

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
