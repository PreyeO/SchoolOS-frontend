"use client";

import { useMemo } from "react";

import type { ResultSubmission, SubmissionStatus } from "../types";

// Ordered by what needs doing, not alphabetically. Anything waiting on the admin
// comes first; approved work sinks to the bottom because it needs nothing.
const STATUS_ORDER: SubmissionStatus[] = ["submitted", "rejected", "draft", "approved"];

// Matches the other paginated directories (Staff/Students/Parents/Admins,
// Pending Invites) — a page's worth of rows at a glance, not the whole term's
// queue at once.
export const REVIEW_QUEUE_PAGE_SIZE = 25;

interface Args {
  allSubmissions: ResultSubmission[] | undefined;
  armId: string;
  subjectId: string;
  page: number;
}

// The derivation ReviewQueuePage renders from: what filter options exist,
// what the filtered-and-sorted term looks like as a whole, and which slice of
// it is the current page. Pulled out of the page component because none of
// this is JSX — it's the part worth reasoning about (and could be unit tested)
// independently of how it's laid out on screen.
export function useReviewQueueView({ allSubmissions, armId, subjectId, page }: Args) {
  // Only subjects that actually appear in this term's queue. Offering one
  // nobody has submitted would filter to an empty table with nothing to
  // explain it. Built from the full fetched set, not the current page, so the
  // option list doesn't change as someone pages through.
  const subjects = useMemo(() => {
    const seen = new Map<string, string>();
    (allSubmissions ?? []).forEach((s) => seen.set(s.subject, s.subject_name));
    return [...seen.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allSubmissions]);

  // Filtered and sorted over the COMPLETE term (useReviewQueue fetches every
  // page), so "submitted, awaiting review" items surface first across the
  // whole queue rather than only within whichever page happened to load —
  // that ordering is the reason this is sliced client-side below instead of
  // paged by the server, which has no equivalent ordering param.
  const filteredSubmissions = useMemo(() => {
    return [...(allSubmissions ?? [])]
      .filter((s) => (!armId || s.class_arm === armId) && (!subjectId || s.subject === subjectId))
      .sort((a, b) => {
        const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        if (byStatus !== 0) return byStatus;
        const byClass = `${a.class_name}${a.arm_name}`.localeCompare(
          `${b.class_name}${b.arm_name}`,
        );
        return byClass !== 0 ? byClass : a.subject_name.localeCompare(b.subject_name);
      });
  }, [allSubmissions, armId, subjectId]);

  const submissions = useMemo(
    () =>
      filteredSubmissions.slice(
        (page - 1) * REVIEW_QUEUE_PAGE_SIZE,
        page * REVIEW_QUEUE_PAGE_SIZE,
      ),
    [filteredSubmissions, page],
  );

  // Counted over the full filtered queue, not just the visible page — "12
  // awaiting your review" has to mean the whole term, or paging to page 2
  // would make it look like most of the work vanished.
  const awaiting = filteredSubmissions.filter((s) => s.status === "submitted").length;

  return { subjects, filteredSubmissions, submissions, awaiting };
}
