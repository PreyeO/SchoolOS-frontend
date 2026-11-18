"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { buildArmOptions } from "@/lib/school/arm-options";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { REVIEW_QUEUE_PAGE_SIZE, useReviewQueue, useReviewQueuePage } from "../hooks/use-review-queue";
import { useReviewQueueSubjects } from "../hooks/use-review-queue-subjects";
import { useReviewQueueView } from "../hooks/use-review-queue-view";
import {
  useApproveResult,
  useRejectResult,
  useUnlockResult,
} from "../hooks/use-submission-actions";
import { pageByStatus, STATUS_FILTERS } from "../lib/review-queue-filter";
import type { ResultSubmission, SubmissionStatus } from "../types";
import { NoTermsNotice } from "./no-terms-notice";
import { type ReviewAction, ReviewActionDialogs } from "./review-action-dialogs";
import { ReviewQueueEmpty } from "./review-queue-empty";
import { ReviewQueueFilters } from "./review-queue-filters";
import { ReviewQueueList } from "./review-queue-list";
import { SubmissionScoresDialog } from "./submission-scores-dialog";
import { TermBadge } from "./term-badge";

interface Props {
  // From ?status=, set by the dashboard's "Results this term" rows.
  initialStatus?: SubmissionStatus | "";
}

export function ReviewQueuePage({ initialStatus = "" }: Props) {
  // Term, class and subject all key the request now — see use-review-queue.ts.
  const term = useTermSelection();
  const { data: classes } = useClasses();
  const [status, setStatus] = useState<SubmissionStatus | "">(initialStatus);
  const [armId, setArmId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [page, setPage] = useState(1);
  const byStatus = status !== "";
  const filters = { classArmId: armId || undefined, subjectId: subjectId || undefined };

  // Two sources, one live at a time. "All statuses" pages the server, 25 at a
  // time. A status reads the whole term (the dashboard already loaded it, so
  // arriving from there is instant) and pages it here: the server can't filter
  // by status, and its newest-first pages scattered "4 awaiting" across pages
  // 1, 2 and 3.
  const serverPage = useReviewQueuePage(term.periodId, page, filters, !byStatus);
  const wholeTerm = useReviewQueue(byStatus ? term.periodId : null);
  const { isPending, isError, error } = byStatus ? wholeTerm : serverPage;

  const approve = useApproveResult();
  const reject = useRejectResult();
  const unlock = useUnlockResult();
  const [action, setAction] = useState<ReviewAction | null>(null);
  const [viewing, setViewing] = useState<ResultSubmission | null>(null);

  const armGroups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const { subjects, isPending: subjectsPending } = useReviewQueueSubjects(armId);
  const serverView = useReviewQueueView({ submissions: serverPage.data?.results });
  // Not memoised: one term's submissions is at most a few hundred rows.
  const statusView = byStatus
    ? pageByStatus(wholeTerm.data ?? [], { status, ...filters }, page, REVIEW_QUEUE_PAGE_SIZE)
    : null;

  const submissions = statusView ? statusView.rows : serverView.submissions;
  const count = statusView ? statusView.count : (serverPage.data?.count ?? 0);
  const currentPage = statusView ? statusView.page : page;
  const filtered = byStatus || !!armId || !!subjectId;

  const statusSummary = STATUS_FILTERS.find((f) => f.value === status)?.summary;
  const summary = statusView ? (
    <>
      <span className="font-medium text-ink">{count}</span> {statusSummary}
      {armId || subjectId ? " for these filters" : " this term"}
    </>
  ) : serverView.awaiting === 0 ? (
    "Nothing on this page is waiting on you."
  ) : (
    <>
      <span className="font-medium text-ink">{serverView.awaiting}</span> awaiting your review on this
      page
    </>
  );

  function resetPage() {
    setPage(1);
  }

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
            status={status}
            onStatusChange={(next) => { setStatus(next); resetPage(); }}
            termGroups={term.groups}
            periodId={term.periodId}
            onPeriodChange={(id) => { term.setPeriodId(id); resetPage(); }}
            armGroups={armGroups}
            armId={armId}
            // Clears the subject pick too: the dropdown's own options just
            // narrowed to this arm (see useReviewQueueSubjects), and a subject
            // that isn't taught here would otherwise sit selected but absent
            // from its own list.
            onArmChange={(id) => { setArmId(id); setSubjectId(""); resetPage(); }}
            subjects={subjects}
            subjectId={subjectId}
            onSubjectChange={(id) => { setSubjectId(id); resetPage(); }}
            subjectsPending={subjectsPending}
          />
          {submissions.length === 0 ? (
            <ReviewQueueEmpty filtered={filtered} />
          ) : (
            <>
              <ReviewQueueList
                submissions={submissions}
                summary={summary}
                isApproving={approve.isPending}
                onView={setViewing}
                onApprove={(s) => approve.mutate({ id: s.id })}
                onSendBack={(s) => setAction({ kind: "reject", submission: s })}
                onUnlock={(s) => setAction({ kind: "unlock", submission: s })}
              />
              <PaginationControls
                page={currentPage}
                pageSize={REVIEW_QUEUE_PAGE_SIZE}
                count={count}
                onPageChange={setPage}
              />
            </>
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
