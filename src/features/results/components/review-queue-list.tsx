"use client";

import type { ReactNode } from "react";

import { ReviewQueueRow } from "./review-queue-row";
import type { ResultSubmission } from "../types";

interface Props {
  // This page's rows, sorted.
  submissions: ResultSubmission[];
  // The line above the list. Worded by the page, because what it can claim
  // depends on the view: "N awaiting your review on this page" when paging the
  // server (it can't see the rest of the term), "N awaiting your review this
  // term" when filtered by status (it reads the whole term).
  summary: ReactNode;
  isApproving: boolean;
  onView: (s: ResultSubmission) => void;
  onApprove: (s: ResultSubmission) => void;
  onSendBack: (s: ResultSubmission) => void;
  onUnlock: (s: ResultSubmission) => void;
}

export function ReviewQueueList({
  submissions,
  summary,
  isApproving,
  onView,
  onApprove,
  onSendBack,
  onUnlock,
}: Props) {
  return (
    <>
      <p className="text-sm text-n-500">{summary}</p>

      <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
        {submissions.map((s) => (
          <ReviewQueueRow
            key={s.id}
            submission={s}
            isApproving={isApproving}
            onView={() => onView(s)}
            onApprove={() => onApprove(s)}
            onSendBack={() => onSendBack(s)}
            onUnlock={() => onUnlock(s)}
          />
        ))}
      </ul>
    </>
  );
}
