import { apiClient } from "@/lib/api/client";
import { CLASS_ARM_ENDPOINTS, SUBJECT_ENDPOINTS } from "@/lib/api/endpoints";

import type { LeaderboardOverallRow, LeaderboardSubjectRow } from "../types";

// Both endpoints return a plain array, not a paginated envelope — verified live.

// Overall standing across every subject, by average descending.
//
// Returns [] until the arm's broadsheet is locked: StudentResultSummary rows
// are only written at lock time, so before that there is genuinely nothing to
// rank rather than an error.
export async function getOverallLeaderboard(
  classArmId: string,
  academicPeriodId: string,
): Promise<LeaderboardOverallRow[]> {
  const { data } = await apiClient.get<LeaderboardOverallRow[]>(
    CLASS_ARM_ENDPOINTS.LEADERBOARD(classArmId),
    { params: { academic_period_id: academicPeriodId } },
  );
  return data;
}

// One subject, by total score descending. Unlike the overall board this reads
// StudentSubjectResult, which exists as soon as scores are entered — so it
// works before publishing.
//
// Exactly one of classId / classArmId, never both and never neither; the
// backend 400s on either mistake. classArmId ranks within the one arm,
// classId ranks across every arm under that class.
export async function getSubjectLeaderboard(
  subjectId: string,
  academicPeriodId: string,
  scope: { classArmId: string } | { classId: string },
): Promise<LeaderboardSubjectRow[]> {
  const { data } = await apiClient.get<LeaderboardSubjectRow[]>(
    SUBJECT_ENDPOINTS.LEADERBOARD(subjectId),
    {
      params: {
        academic_period_id: academicPeriodId,
        ...("classArmId" in scope
          ? { class_arm_id: scope.classArmId }
          : { class_id: scope.classId }),
      },
    },
  );
  return data;
}
