"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";

import { useReviewQueue } from "../hooks/use-review-queue";
import { NoCurrentTermNotice } from "./no-current-term-notice";
import { ReviewQueueRow } from "./review-queue-row";
import { TermBadge } from "./term-badge";
import { useScoreSheets } from "../hooks/use-score-sheets";
import {
  useApproveResult,
  useRejectResult,
  useUnlockResult,
} from "../hooks/use-submission-actions";
import type { ResultSubmission, SubmissionStatus } from "../types";
import { ReviewActionDialogs, type ReviewAction } from "./review-action-dialogs";
import { SubmissionScoresDialog } from "./submission-scores-dialog";

// Ordered by what needs doing, not alphabetically. Anything waiting on the admin
// comes first; approved work sinks to the bottom because it needs nothing.
const STATUS_ORDER: SubmissionStatus[] = ["submitted", "rejected", "draft", "approved"];

export function ReviewQueuePage() {
  const { currentTerm, isPending: termLoading } = useScoreSheets();
  const { data, isPending, isError, error } = useReviewQueue(currentTerm?.id);
  const approve = useApproveResult();
  const reject = useRejectResult();
  const unlock = useUnlockResult();
  const [action, setAction] = useState<ReviewAction | null>(null);
  const [viewing, setViewing] = useState<ResultSubmission | null>(null);

  const submissions = useMemo(() => {
    return [...(data?.submissions ?? [])].sort((a, b) => {
      const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (byStatus !== 0) return byStatus;
      const byClass = `${a.class_name}${a.arm_name}`.localeCompare(`${b.class_name}${b.arm_name}`);
      return byClass !== 0 ? byClass : a.subject_name.localeCompare(b.subject_name);
    });
  }, [data]);

  const awaiting = submissions.filter((s) => s.status === "submitted").length;

  if (termLoading || isPending) {
    return <p className="text-sm text-n-400" role="status">Loading submissions…</p>;
  }

  if (isError) {
    return <ErrorState error={error} resourceLabel="result submissions" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Result review</h1>
          <p className="mt-1 text-sm text-n-500">
            Approve the scores teachers have submitted, or send them back with a note.
          </p>
        </div>
        {currentTerm && <TermBadge label={currentTerm.label} />}
      </div>

      {!currentTerm ? (
        <NoCurrentTermNotice consequence="there are no results to review" />
      ) : submissions.length === 0 ? (
        <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-ink">Nothing submitted yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
            A subject appears here once its teacher has entered and saved at least one score.
          </p>
        </div>
      ) : (
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
                isApproving={approve.isPending}
                onView={() => setViewing(s)}
                onApprove={() => approve.mutate({ id: s.id })}
                onSendBack={() => setAction({ kind: "reject", submission: s })}
                onUnlock={() => setAction({ kind: "unlock", submission: s })}
              />
            ))}
          </ul>

          {data && data.total > submissions.length && (
            <p className="text-xs text-clay">
              Showing {submissions.length} of {data.total} — this term exceeds the
              100-per-request limit, so the queue is incomplete.
            </p>
          )}
        </>
      )}

      {viewing && (
        <SubmissionScoresDialog
          submission={viewing}
          open={!!viewing}
          onOpenChange={(next) => !next && setViewing(null)}
          isApproving={approve.isPending}
          onApprove={() => {
            approve.mutate({ id: viewing.id });
            setViewing(null);
          }}
          onSendBack={() => {
            // Hand straight to the note dialog, so the reason can name the gap
            // that was just spotted in the grid.
            setAction({ kind: "reject", submission: viewing });
            setViewing(null);
          }}
        />
      )}

      <ReviewActionDialogs
        action={action}
        onClose={() => setAction(null)}
        isRejecting={reject.isPending}
        isUnlocking={unlock.isPending}
        onReject={(comment) => reject.mutateAsync({ id: action!.submission.id, body: { comment } })}
        onUnlock={(reason) => unlock.mutateAsync({ id: action!.submission.id, body: { reason } })}
      />
    </div>
  );
}
