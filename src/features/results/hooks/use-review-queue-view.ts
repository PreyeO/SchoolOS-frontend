"use client";

import { useMemo } from "react";

import { sortSubmissions } from "../lib/review-queue-filter";
import type { ResultSubmission } from "../types";

interface Args {
  submissions: ResultSubmission[] | undefined;
}

// Sorts one already-fetched server page (the "All statuses" view).
//
// Only within that page, not the whole term: see use-review-queue.ts on why
// paging server-side (2026-09-05) gave that up. Picking a status switches the
// page to pageByStatus instead, which does see the whole term.
export function useReviewQueueView({ submissions }: Args) {
  const sorted = useMemo(() => sortSubmissions(submissions ?? []), [submissions]);

  // Counted over this page only, and worded on screen ("...on this page") so
  // it doesn't overclaim a whole-term total it can't see.
  const awaiting = sorted.filter((s) => s.status === "submitted").length;

  return { submissions: sorted, awaiting };
}
