import { apiClient } from "@/lib/api/client";
import { RESULT_SUBMISSION_ENDPOINTS, SCORE_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  BulkScoreEntryPayload,
  BulkScoreEntryResponse,
  ResultSubmission,
  Score,
  ScoreFilters,
} from "../types";

// Every score already recorded for one (arm, subject, term) — across all grade
// components, not just the one being entered. page_size=100 (the backend max)
// covers a 30-student class over three components with room to spare; the caller
// reports the overflow rather than silently truncating a grid.
export async function getScores(
  filters: ScoreFilters,
): Promise<{ scores: Score[]; total: number }> {
  const { data } = await apiClient.get<PaginatedResponse<Score>>(SCORE_ENDPOINTS.LIST(), {
    params: { ...filters, page_size: 100 },
  });
  return { scores: data.results, total: data.count };
}

// Upserts on (student, subject, academic_period, grade_component), so a partial
// payload — just the component being entered — is safe to send and safe to
// replay. Returns 200 with `skipped` for entries that lost last-write-wins; a
// 400 means the whole batch was refused, which is how the APPROVED lock reads.
export async function bulkEnterScores(
  payload: BulkScoreEntryPayload,
): Promise<BulkScoreEntryResponse> {
  const { data } = await apiClient.post<BulkScoreEntryResponse>(
    SCORE_ENDPOINTS.BULK_ENTER(),
    payload,
  );
  return data;
}

// The review row for one (arm, subject, term). The backend creates it lazily on
// first score entry, so this legitimately returns nothing before any score
// exists — treat "no row" as DRAFT rather than an error.
//
// Filter keys are the bare FK names (class_arm, subject, academic_period), not
// the *_id form the score filters use — they're plain filterset_fields.
export async function getSubmission(filters: ScoreFilters): Promise<ResultSubmission | null> {
  const { data } = await apiClient.get<PaginatedResponse<ResultSubmission>>(
    RESULT_SUBMISSION_ENDPOINTS.LIST(),
    {
      params: {
        class_arm: filters.class_arm_id,
        subject: filters.subject_id,
        academic_period: filters.academic_period_id,
      },
    },
  );
  return data.results[0] ?? null;
}
