"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { buildArmOptions } from "@/lib/school/arm-options";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useReviewQueue } from "../hooks/use-review-queue";
import {
  useApproveResult,
  useRejectResult,
  useUnlockResult,
} from "../hooks/use-submission-actions";
import type { ResultSubmission, SubmissionStatus } from "../types";
import { NoTermsNotice } from "./no-terms-notice";
import { type ReviewAction, ReviewActionDialogs } from "./review-action-dialogs";
import { ReviewQueueEmpty } from "./review-queue-empty";
import { ReviewQueueFilters } from "./review-queue-filters";
import { ReviewQueueList } from "./review-queue-list";
import { SubmissionScoresDialog } from "./submission-scores-dialog";
import { TermBadge } from "./term-badge";

// Ordered by what needs doing, not alphabetically. Anything waiting on the admin
// comes first; approved work sinks to the bottom because it needs nothing.
const STATUS_ORDER: SubmissionStatus[] = ["submitted", "rejected", "draft", "approved"];

export function ReviewQueuePage() {
  // Term keys the request; class and subject narrow what came back.
  const term = useTermSelection();
  const { data: classes } = useClasses();
  const { data, isPending, isError, error } = useReviewQueue(term.periodId);
  const [armId, setArmId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const approve = useApproveResult();
  const reject = useRejectResult();
  const unlock = useUnlockResult();
  const [action, setAction] = useState<ReviewAction | null>(null);
  const [viewing, setViewing] = useState<ResultSubmission | null>(null);

  const armGroups = useMemo(() => buildArmOptions(classes ?? []), [classes]);

  // Only subjects that actually appear in this term's queue. Offering one nobody
  // has submitted would filter to an empty table with nothing to explain it.
  const subjects = useMemo(() => {
    const seen = new Map<string, string>();
    (data?.submissions ?? []).forEach((s) => seen.set(s.subject, s.subject_name));
    return [...seen.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const submissions = useMemo(() => {
    return [...(data?.submissions ?? [])]
      .filter((s) => (!armId || s.class_arm === armId) && (!subjectId || s.subject === subjectId))
      .sort((a, b) => {
        const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        if (byStatus !== 0) return byStatus;
        const byClass = `${a.class_name}${a.arm_name}`.localeCompare(
          `${b.class_name}${b.arm_name}`,
        );
        return byClass !== 0 ? byClass : a.subject_name.localeCompare(b.subject_name);
      });
  }, [data, armId, subjectId]);

  const awaiting = submissions.filter((s) => s.status === "submitted").length;
  const filtered = !!armId || !!subjectId;

  if (term.isPending || isPending) {
    return (
      <p className="text-sm text-n-400" role="status">
        Loading submissions…
      </p>
    );
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
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      {!term.hasTerms ? (
        <NoTermsNotice consequence="there are no results to review" />
      ) : (
        <>
          <ReviewQueueFilters
            termGroups={term.groups}
            periodId={term.periodId}
            onPeriodChange={term.setPeriodId}
            armGroups={armGroups}
            armId={armId}
            onArmChange={setArmId}
            subjects={subjects}
            subjectId={subjectId}
            onSubjectChange={setSubjectId}
          />
          {submissions.length === 0 ? (
            <ReviewQueueEmpty filtered={filtered} />
          ) : (
            <ReviewQueueList
              submissions={submissions}
              awaiting={awaiting}
              fetched={data?.submissions.length ?? 0}
              total={data?.total ?? 0}
              isApproving={approve.isPending}
              onView={setViewing}
              onApprove={(s) => approve.mutate({ id: s.id })}
              onSendBack={(s) => setAction({ kind: "reject", submission: s })}
              onUnlock={(s) => setAction({ kind: "unlock", submission: s })}
            />
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
