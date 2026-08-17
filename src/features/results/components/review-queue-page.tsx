"use client";

import { useMemo, useState } from "react";
import { CalendarRange, CheckCircle2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { formatTimestamp } from "@/lib/text/format-timestamp";
import { cn } from "@/lib/utils";

import { useReviewQueue } from "../hooks/use-review-queue";
import { useScoreSheets } from "../hooks/use-score-sheets";
import {
  useApproveResult,
  useRejectResult,
  useUnlockResult,
} from "../hooks/use-submission-actions";
import type { ResultSubmission, SubmissionStatus } from "../types";
import { ReviewActionDialog } from "./review-action-dialog";

const STATUS_META: Record<SubmissionStatus, { label: string; className: string }> = {
  draft: { label: "Not submitted", className: "bg-n-100 text-n-500" },
  submitted: { label: "Awaiting review", className: "bg-amber/15 text-amber" },
  approved: { label: "Approved", className: "bg-grass/10 text-grass" },
  rejected: { label: "Sent back", className: "bg-clay/10 text-clay" },
};

// Ordered by what needs doing, not alphabetically. Anything waiting on the admin
// comes first; approved work sinks to the bottom because it needs nothing.
const STATUS_ORDER: SubmissionStatus[] = ["submitted", "rejected", "draft", "approved"];

type PendingAction = { kind: "reject" | "unlock"; submission: ResultSubmission } | null;

export function ReviewQueuePage() {
  const { currentTerm, isPending: termLoading } = useScoreSheets();
  const { data, isPending, isError, error } = useReviewQueue(currentTerm?.id);
  const approve = useApproveResult();
  const reject = useRejectResult();
  const unlock = useUnlockResult();
  const [action, setAction] = useState<PendingAction>(null);

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
        {currentTerm && (
          <span className="flex items-center gap-1.5 rounded-full border border-n-200 bg-white px-2.5 py-1 text-xs text-n-600">
            <CalendarRange className="size-3.5 shrink-0 text-n-400" />
            {currentTerm.label}
          </span>
        )}
      </div>

      {!currentTerm ? (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
          No term is marked current, so there are no results to review.
        </p>
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
              <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {s.subject_name}
                  </span>
                  <span className="block truncate text-xs text-n-400">
                    {s.arm_name || s.class_name}
                    {s.submitted_at && s.submitted_by && (
                      <>
                        {" · "}
                        {s.submitted_by.first_name} {s.submitted_by.last_name},{" "}
                        {formatTimestamp(s.submitted_at)}
                      </>
                    )}
                  </span>
                </span>

                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                    STATUS_META[s.status].className,
                  )}
                >
                  {STATUS_META[s.status].label}
                </span>

                {/* Only what this row can actually do next. A draft has nothing
                    for an admin to act on — it's the teacher's turn. */}
                {s.status === "submitted" && (
                  <span className="flex shrink-0 gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAction({ kind: "reject", submission: s })}
                      className="h-8 text-xs text-clay hover:bg-clay/10 hover:text-clay"
                    >
                      Send back
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => approve.mutate({ id: s.id })}
                      disabled={approve.isPending}
                      className="h-8 text-xs"
                    >
                      <CheckCircle2 className="size-3.5 mr-1" />
                      Approve
                    </Button>
                  </span>
                )}

                {s.status === "approved" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAction({ kind: "unlock", submission: s })}
                    className="h-8 shrink-0 text-xs text-n-500"
                  >
                    <Undo2 className="size-3.5 mr-1" />
                    Unlock
                  </Button>
                )}

                {s.status === "rejected" && s.review_comment && (
                  <span className="w-full text-xs text-n-500">
                    <span className="font-medium">Sent back:</span> {s.review_comment}
                  </span>
                )}
              </li>
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

      <ReviewActionDialog
        open={action?.kind === "reject"}
        onOpenChange={(next) => !next && setAction(null)}
        title={`Send ${action?.submission.subject_name ?? ""} back?`}
        description="The teacher can edit and re-submit. Your note is what they'll see, so say what needs changing."
        label="What needs fixing"
        placeholder="e.g. Exam scores for three students are missing."
        confirmLabel="Send back"
        required
        destructive
        isPending={reject.isPending}
        onConfirm={(comment) =>
          reject.mutateAsync({ id: action!.submission.id, body: { comment } })
        }
      />

      <ReviewActionDialog
        open={action?.kind === "unlock"}
        onOpenChange={(next) => !next && setAction(null)}
        title={`Unlock ${action?.submission.subject_name ?? ""}?`}
        description="This reopens the subject for editing and returns it to awaiting review. The reason is recorded in the audit log."
        label="Reason for unlocking"
        placeholder="e.g. Two scores were transposed and need correcting."
        confirmLabel="Unlock"
        required
        isPending={unlock.isPending}
        onConfirm={(reason) =>
          unlock.mutateAsync({ id: action!.submission.id, body: { reason } })
        }
      />
    </div>
  );
}
