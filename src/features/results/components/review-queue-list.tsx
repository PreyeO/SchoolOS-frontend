"use client";

import { ReviewQueueRow } from "./review-queue-row";
import type { ResultSubmission } from "../types";

interface Props {
  submissions: ResultSubmission[];
  awaiting: number;
  // What the server actually returned for this term, before class/subject
  // filtering — the truncation warning has to compare against this, not against
  // what's on screen.
  fetched: number;
  total: number;
  isApproving: boolean;
  onView: (s: ResultSubmission) => void;
  onApprove: (s: ResultSubmission) => void;
  onSendBack: (s: ResultSubmission) => void;
  onUnlock: (s: ResultSubmission) => void;
}

export function ReviewQueueList({
  submissions,
  awaiting,
  fetched,
  total,
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

      {/* Compared against what was FETCHED, not what's displayed — with a class
          or subject filter on, displayed is always fewer, and comparing to that
          would claim truncation on every filtered view. */}
      {total > fetched && (
        <p className="text-xs text-clay">
          Showing {fetched} of {total} — this term exceeds the 100-per-request limit, so the
          queue is incomplete.
        </p>
      )}
    </>
  );
}
