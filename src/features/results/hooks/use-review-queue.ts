"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { RESULT_SUBMISSION_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { ResultSubmission, SubmissionStatus } from "../types";

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
  // Server-side since backend cb9e018 added `status` to filterset_fields.
  status?: SubmissionStatus;
}

// The queue's priority order, done by the server across the whole term.
// Statuses are lowercase strings, and descending alphabetical (submitted,
// rejected, draft, approved) is exactly "what needs the admin first", the
// same order sortSubmissions applies within a page. created_at breaks ties so
// paging is stable.
const PRIORITY_ORDERING = "-status,-created_at";

// One page of this term's submissions, filtered and ordered server-side — what
// the review queue's browsing table uses. Paged on the server (2026-09-05)
// because fetching the whole term made the table wait for every page first.
//
// Paging used to cost the queue its whole-term priority sort and an honest
// "N awaiting" figure: the backend had no status filter and no ordering param,
// so awaiting rows scattered across pages. Backend cb9e018 added both, so
// `ordering` puts awaiting work first across the term, and `status` returns
// one status's rows (and a whole-term count) directly.
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
        ordering: PRIORITY_ORDERING,
        ...(filters.classArmId ? { class_arm: filters.classArmId } : {}),
        ...(filters.subjectId ? { subject: filters.subjectId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
    },
  );
  return data;
}

// How many of this term's submissions are in each status, as four requests
// of page_size=1 reading only `count`. For the admin home, which shows these
// numbers and nothing else, instead of downloading every submission
// (useReviewQueue) to count them in the browser.
export type SubmissionStatusCounts = Record<SubmissionStatus, number>;

export async function getSubmissionStatusCounts(academicPeriodId: string): Promise<SubmissionStatusCounts> {
  const statuses: SubmissionStatus[] = ["submitted", "rejected", "draft", "approved"];
  const counts = await Promise.all(
    statuses.map(async (status) => {
      const { data } = await apiClient.get<PaginatedResponse<ResultSubmission>>(RESULT_SUBMISSION_ENDPOINTS.LIST(), {
        params: { academic_period: academicPeriodId, status, page_size: 1 },
      });
      return [status, data.count] as const;
    }),
  );
  return Object.fromEntries(counts) as SubmissionStatusCounts;
}

export function useSubmissionStatusCounts(academicPeriodId: string | null | undefined) {
  return useQuery({
    // Under REVIEW_QUEUE_QUERY_KEY, so approve/reject/unlock (which invalidate
    // ["results"]) refresh these too.
    queryKey: [...REVIEW_QUEUE_QUERY_KEY, "counts", academicPeriodId],
    queryFn: () => getSubmissionStatusCounts(academicPeriodId as string),
    enabled: !!academicPeriodId,
  });
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
