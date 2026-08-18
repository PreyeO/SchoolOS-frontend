"use client";

import { CheckCircle2, Eye, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { armDisplayName } from "@/lib/school/arm-display-name";
import { formatTimestamp } from "@/lib/text/format-timestamp";
import { cn } from "@/lib/utils";

import type { ResultSubmission, SubmissionStatus } from "../types";

// Amber for "awaiting review" on purpose: it's the only status that is the
// admin's turn to act, and it should read as outstanding rather than as
// neutral information.
const STATUS_META: Record<SubmissionStatus, { label: string; className: string }> = {
  draft: { label: "Not submitted", className: "bg-n-100 text-n-500" },
  submitted: { label: "Awaiting review", className: "bg-amber/15 text-amber" },
  approved: { label: "Approved", className: "bg-grass/10 text-grass" },
  rejected: { label: "Sent back", className: "bg-clay/10 text-clay" },
};

interface Props {
  submission: ResultSubmission;
  isApproving: boolean;
  onView: () => void;
  onApprove: () => void;
  onSendBack: () => void;
  onUnlock: () => void;
}

// One subject's submission, with only the actions its current status allows.
export function ReviewQueueRow({
  submission: s,
  isApproving,
  onView,
  onApprove,
  onSendBack,
  onUnlock,
}: Props) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3.5">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{s.subject_name}</span>
        <span className="block truncate text-xs text-n-400">
          {armDisplayName({ name: s.arm_name }, s.class_name)}
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

      {/* On every row, not just submitted ones — a reviewer often wants to see
          what was approved last week, or why something is still a draft. The
          act-on-it buttons below stay conditional: a draft is the teacher's
          turn, not the admin's. */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onView}
        className="h-8 shrink-0 text-xs text-primary"
      >
        <Eye className="size-3.5 mr-1" />
        View scores
      </Button>

      {s.status === "submitted" && (
        <span className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSendBack}
            className="h-8 text-xs text-clay hover:bg-clay/10 hover:text-clay"
          >
            Send back
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onApprove}
            disabled={isApproving}
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
          onClick={onUnlock}
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
  );
}
