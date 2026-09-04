"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { RESULT_SUBMISSION_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { ResultSubmission } from "../types";

export const REVIEW_QUEUE_QUERY_KEY = ["results", "review-queue"];
export const REVIEW_QUEUE_PAGE_SIZE = 25;

// Every submission for a term, across all classes and subjects. Used for
// whole-term SUMMARIES — useResultsProgress's outstanding/awaiting/approved
// counts, and Publish Results' own progress reasoning — which genuinely need
// every row, not one page of it. NOT used by the review queue's own browsing
// table any more (see useReviewQueuePage below) — that one pages server-side,
// since browsing doesn't need the whole term in memory at once the way a
// term-wide count does.
//
// Fetches every page rather than stopping at one: a ClassArmSubjectResultSubmission
// row only exists once a teacher has entered at least one score for that
// (class_arm, subject, period) — created lazily, see the model's own
// docstring — so the true total is bounded by real submitted work for ONE
// term, not by pupil count. Genuinely large (multiple hundreds) only for a
// big school deep into a term, and even then this is a handful of requests.
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
    queryKey: [...REVIEW_QUEUE_QUERY_KEY, "all", academicPeriodId],
    queryFn: () => getReviewQueue(academicPeriodId as string),
    enabled: !!academicPeriodId,
  });
}

export interface ReviewQueuePageFilters {
  classArmId?: string;
  subjectId?: string;
}

// One page of this term's submissions, filtered server-side by class/subject
// (ClassArmSubjectResultSubmissionViewSet.filterset_fields covers both) — what
// the review queue's own browsing table uses (2026-09-05, at the user's
// explicit request: fetching the whole term up front, as getReviewQueue above
// still does for the summary screens, made the browsing table wait on however
// many pages the term happened to have before the first row could render).
//
// What paging server-side gives up, and why: the queue's own priority sort —
// submitted-and-awaiting first, everything else after — used to sort the
// COMPLETE term, so nothing needing review could be buried behind an earlier
// page's worth of already-approved rows. Sorting only within whichever page
// is loaded (still done — see useReviewQueueView) can't reproduce that once
// paged server-side, because the backend orders submissions by `-created_at`
// (ClassArmSubjectResultSubmission.Meta.ordering) with no ordering param
// exposed to ask for anything else. The "N awaiting your review" figure has
// the same problem for the same reason, compounded by `status` not even being
// in filterset_fields — there's no way to ask the backend for just a count of
// submitted-status rows either. Both are now page-scoped. See docs/asks/ for
// the backend ask that would let either come back.
export async function getReviewQueuePage(
  academicPeriodId: string,
  page: number,
  filters: ReviewQueuePageFilters,
): Promise<PaginatedResponse<ResultSubmission>> {
  const { data } = await apiClient.get<PaginatedResponse<ResultSubmission>>(
    RESULT_SUBMISSION_ENDPOINTS.LIST(),
    {
      params: {
        academic_period: academicPeriodId,
        page,
        page_size: REVIEW_QUEUE_PAGE_SIZE,
        ...(filters.classArmId ? { class_arm: filters.classArmId } : {}),
        ...(filters.subjectId ? { subject: filters.subjectId } : {}),
      },
    },
  );
  return data;
}

export function useReviewQueuePage(
  academicPeriodId: string | null | undefined,
  page: number,
  filters: ReviewQueuePageFilters,
) {
  return useQuery({
    queryKey: [...REVIEW_QUEUE_QUERY_KEY, "page", academicPeriodId, page, filters],
    queryFn: () => getReviewQueuePage(academicPeriodId as string, page, filters),
    enabled: !!academicPeriodId,
    // Keeps the current page's rows on screen while the next page loads,
    // instead of collapsing the whole list to a spinner on every click.
    placeholderData: (previous) => previous,
  });
}
