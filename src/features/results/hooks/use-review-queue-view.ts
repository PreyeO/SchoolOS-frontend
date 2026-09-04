"use client";

import { useMemo } from "react";

import type { ResultSubmission, SubmissionStatus } from "../types";

// Ordered by what needs doing, not alphabetically. Anything waiting on the admin
// comes first; approved work sinks to the bottom because it needs nothing.
//
// Only within the current page now, not the whole term — see the comment in
// use-review-queue.ts on why paging server-side (2026-09-05) gave that up.
const STATUS_ORDER: SubmissionStatus[] = ["submitted", "rejected", "draft", "approved"];

interface Args {
  submissions: ResultSubmission[] | undefined;
}

// Sorts one already-fetched, already-filtered page. Pulled out of the page
// component because it isn't JSX — the part worth reasoning about (and could
// be unit tested) independently of how it's laid out on screen.
export function useReviewQueueView({ submissions }: Args) {
  const sorted = useMemo(() => {
    return [...(submissions ?? [])].sort((a, b) => {
      const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (byStatus !== 0) return byStatus;
      const byClass = `${a.class_name}${a.arm_name}`.localeCompare(
        `${b.class_name}${b.arm_name}`,
      );
      return byClass !== 0 ? byClass : a.subject_name.localeCompare(b.subject_name);
    });
  }, [submissions]);

  // Counted over this page only — see the file comment. Worded on screen
  // ("...on this page") so it doesn't overclaim a whole-term total it can no
  // longer see.
  const awaiting = sorted.filter((s) => s.status === "submitted").length;

  return { submissions: sorted, awaiting };
}
