"use client";

import { ReviewQueueRow } from "./review-queue-row";
import type { ResultSubmission } from "../types";

interface Props {
  // This page's rows, sorted — see useReviewQueueView.
  submissions: ResultSubmission[];
  // Counted over this page only, not the whole term (2026-09-05 — see
  // use-review-queue.ts for why paging server-side gave up the whole-term
  // figure), hence "on this page" in the label below rather than an
  // unqualified total.
  awaiting: number;
  isApproving: boolean;
  onView: (s: ResultSubmission) => void;
  onApprove: (s: ResultSubmission) => void;
  onSendBack: (s: ResultSubmission) => void;
  onUnlock: (s: ResultSubmission) => void;
}

export function ReviewQueueList({
  submissions,
  awaiting,
  isApproving,
  onView,
  onApprove,
  onSendBack,
  onUnlock,
}: Props) {
  return (
    <>
      <p className="text-sm text-n-500">
        {awaiting === 0 ? (
          "Nothing on this page is waiting on you."
        ) : (
          <>
            <span className="font-medium text-ink">{awaiting}</span> awaiting your review on this
            page
          </>
        )}
      </p>

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
