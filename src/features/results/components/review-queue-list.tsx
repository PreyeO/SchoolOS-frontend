"use client";

import { ReviewQueueRow } from "./review-queue-row";
import type { ResultSubmission } from "../types";

interface Props {
  // Already the current page's slice — ReviewQueuePage owns pagination over
  // the complete, correctly-sorted term.
  submissions: ResultSubmission[];
  // Counted over the whole term, not just this page — see ReviewQueuePage.
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
          "Nothing is waiting on you."
        ) : (
          <>
            <span className="font-medium text-ink">{awaiting}</span> awaiting your review
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
