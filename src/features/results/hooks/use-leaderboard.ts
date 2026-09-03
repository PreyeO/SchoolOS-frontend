"use client";

import { useQuery } from "@tanstack/react-query";

import type { StudentListItem } from "@/features/students/types";

import { getOverallLeaderboard, getSubjectLeaderboard } from "../api/leaderboard-api";

export const LEADERBOARD_QUERY_KEY = ["results", "leaderboard"];

export interface RankedRow {
  studentId: string;
  student: StudentListItem;
  rank: number;
  score: number;
  grade: string | null;
  // Which arm the row came from. Only meaningful when ranking a subject across
  // a whole class, where rows span several arms.
  armLabel: string | null;
}

// Dense rank over an already-sorted list, so equal scores share a place.
//
// The server orders by score, but its own position columns stay null until the
// broadsheet is locked — so before that the rank has to be derived here. Using
// the array index would have called two students on 78% "1st" and "2nd", which
// is wrong in a way a parent would notice immediately.
function denseRanks<T>(rows: T[], scoreOf: (row: T) => number): number[] {
  let lastScore: number | null = null;
  let lastRank = 0;
  return rows.map((row, i) => {
    const score = scoreOf(row);
    if (score !== lastScore) {
      lastRank = i + 1;
      lastScore = score;
    }
    return lastRank;
  });
}

export function useOverallLeaderboard(
  classArmId: string | null | undefined,
  academicPeriodId: string | null | undefined,
) {
  const query = useQuery({
    queryKey: [...LEADERBOARD_QUERY_KEY, "overall", classArmId, academicPeriodId],
    queryFn: () => getOverallLeaderboard(classArmId as string, academicPeriodId as string),
    enabled: !!classArmId && !!academicPeriodId,
  });

  const rows = query.data ?? [];
  const ranks = denseRanks(rows, (r) => Number(r.average_score));

  return {
    ...query,
    rows: rows.map((row, i): RankedRow => ({
      studentId: row.student.id,
      student: row.student,
      // The server's own position wins where it exists — it's what the report
      // card prints, and disagreeing with that would be worse than useless.
      rank: row.position_in_arm ?? ranks[i],
      score: Number(row.average_score),
      grade: null,
      armLabel: null,
    })),
  };
}

export function useSubjectLeaderboard(
  subjectId: string | null | undefined,
  academicPeriodId: string | null | undefined,
  scope: { classArmId: string } | { classId: string } | null,
) {
  const query = useQuery({
    queryKey: [...LEADERBOARD_QUERY_KEY, "subject", subjectId, academicPeriodId, scope],
    queryFn: () => getSubjectLeaderboard(subjectId as string, academicPeriodId as string, scope!),
    enabled: !!subjectId && !!academicPeriodId && !!scope,
  });

  const acrossClass = !!scope && "classId" in scope;
  const rows = query.data ?? [];
  const ranks = denseRanks(rows, (r) => Number(r.total_score));

  return {
    ...query,
    acrossClass,
    rows: rows.map((row, i): RankedRow => ({
      studentId: row.student.id,
      student: row.student,
      // Which stored position applies depends on the scope being ranked —
      // position_in_arm is meaningless once rows span several arms.
      rank:
        (acrossClass ? row.subject_position_in_class : row.subject_position_in_arm) ?? ranks[i],
      score: Number(row.total_score),
      grade: row.grade,
      // Only worth showing when arms are mixed together — and not at all when
      // this class's only arm is the system placeholder (is_default), which
      // otherwise leaked its raw internal name ("{class} - Default") onto the
      // row: there is no second arm to disambiguate FROM in that case, so it's
      // exactly the "no real arm" case that should show nothing rather than a
      // literal "Default".
      armLabel:
        acrossClass && row.student.current_class && !row.student.current_class.is_default
          ? row.student.current_class.arm_name
          : null,
    })),
  };
}
