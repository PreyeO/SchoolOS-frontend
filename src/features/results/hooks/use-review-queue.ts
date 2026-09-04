"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { RESULT_SUBMISSION_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { ResultSubmission } from "../types";

export const REVIEW_QUEUE_QUERY_KEY = ["results", "review-queue"];

// Every submission for a term, across all classes and subjects — the admin's
// view of where results have got to. Unfiltered by status on purpose: an admin
// needs to see what's still outstanding as much as what's waiting on them.
//
// Fetches every page rather than stopping at one, and that's deliberate: a
// ClassArmSubjectResultSubmission row only exists once a teacher has entered at
// least one score for that (class_arm, subject, period) — created lazily, see
// the model's own docstring — so the true total is bounded by real submitted
// work for ONE term, not by pupil count. Genuinely large (multiple hundreds)
// only for a big school deep into a term, and even then this is a handful of
// requests, not an unbounded fetch.
//
// The alternative — a single page_size=100 request with a "showing X of Y,
// incomplete" warning — is what this replaced (2026-09-03). It silently
// dropped the rest of the term for any school that crossed the ceiling, with
// no way to reach it. The reason it has to be a full fetch rather than
// server-paged Next/Previous: the queue's own sort — submitted-and-awaiting
// first, everything else after (see STATUS_ORDER in review-queue-page.tsx) —
// has no backend equivalent (no ordering param on this endpoint), so paging
// through the server's own order would scatter "needs your review" items
// across pages instead of surfacing them. Fetching the complete set once and
// paginating client-side over the correctly-sorted result is what keeps that
// design intact while still not truncating anything.
export async function getReviewQueue(academicPeriodId: string): Promise<ResultSubmission[]> {
  const submissions: ResultSubmission[] = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const { data } = await apiClient.get<PaginatedResponse<ResultSubmission>>(
      RESULT_SUBMISSION_ENDPOINTS.LIST(),
      { params: { academic_period: academicPeriodId, page_size: 100, page } },
    );
    submissions.push(...data.results);
    hasNext = !!data.next;
    page += 1;
  }
  return submissions;
}

export function useReviewQueue(academicPeriodId: string | null | undefined) {
  return useQuery({
    queryKey: [...REVIEW_QUEUE_QUERY_KEY, academicPeriodId],
    queryFn: () => getReviewQueue(academicPeriodId as string),
    enabled: !!academicPeriodId,
  });
}
