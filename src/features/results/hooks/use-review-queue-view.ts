"use client";

import { useMemo } from "react";

import { sortSubmissions } from "../lib/review-queue-filter";
import type { ResultSubmission } from "../types";

interface Args {
  submissions: ResultSubmission[] | undefined;
}

// Sorts one already-fetched server page. The server already orders the term
// awaiting-first (ordering=-status); this adds class and subject order within
// a status, which the endpoint can't sort by.
export function useReviewQueueView({ submissions }: Args) {
  const sorted = useMemo(() => sortSubmissions(submissions ?? []), [submissions]);

  // Counted over this page only. The page shows it only when class/subject are
  // narrowed; otherwise it uses the whole-term count from the server.
  const awaiting = sorted.filter((s) => s.status === "submitted").length;

  return { submissions: sorted, awaiting };
}
