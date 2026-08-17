"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { RESULT_SUBMISSION_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { ResultSubmission } from "../types";

export const REVIEW_QUEUE_QUERY_KEY = ["results", "review-queue"];

// Every submission for a term, across all classes and subjects — the admin's
// view of where results have got to. Unfiltered by status on purpose: an admin
// needs to see what's still outstanding as much as what's waiting on them, and
// a school's total is bounded by classes x subjects rather than by pupils.
//
// page_size=100 (backend max) with the overflow reported, same convention as the
// roster — a school large enough to exceed it needs paging rather than a
// silently truncated queue.
export async function getReviewQueue(
  academicPeriodId: string,
): Promise<{ submissions: ResultSubmission[]; total: number }> {
  const { data } = await apiClient.get<PaginatedResponse<ResultSubmission>>(
    RESULT_SUBMISSION_ENDPOINTS.LIST(),
    { params: { academic_period: academicPeriodId, page_size: 100 } },
  );
  return { submissions: data.results, total: data.count };
}

export function useReviewQueue(academicPeriodId: string | null | undefined) {
  return useQuery({
    queryKey: [...REVIEW_QUEUE_QUERY_KEY, academicPeriodId],
    queryFn: () => getReviewQueue(academicPeriodId as string),
    enabled: !!academicPeriodId,
  });
}
