"use client";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSubmitResult } from "../hooks/use-submission-actions";
import type { ResultSubmission, SubmissionStatus } from "../types";

interface Props {
  submission: ResultSubmission | null | undefined;
  status: SubmissionStatus;
  // Entered across every component, from the saved grid. Submitting with none is
  // refused by the backend, so the control says why rather than offering a
  // button that 400s.
  savedCount: number;
  // Scores typed but not yet saved. Submitting would freeze the sheet without
  // them, so this warns rather than silently leaving work behind.
  unsavedCount: number;
}

// The step that was missing: entered scores sat in DRAFT forever with no way to
// hand them on. Deliberately separated from Save — saving is routine and
// repeatable, submitting is a handover that puts the sheet in front of an admin.
export function SubmitResultBar({ submission, status, savedCount, unsavedCount }: Props) {
  const submit = useSubmitResult();

  // SUBMITTED is awaiting review and APPROVED is final; only DRAFT and REJECTED
  // can be sent, which is exactly what the backend accepts.
  if (!submission || status === "submitted" || status === "approved") return null;

  const nothingToSend = savedCount === 0;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-n-200 bg-white px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">
          {status === "rejected" ? "Re-submit for review" : "Ready to submit?"}
        </p>
        <p className="mt-0.5 text-sm text-n-500">
          {nothingToSend
            ? "Enter and save at least one score first."
            : unsavedCount > 0
              ? `${unsavedCount} score${unsavedCount === 1 ? "" : "s"} on screen ${unsavedCount === 1 ? "is" : "are"} still unsaved — save before submitting, or ${unsavedCount === 1 ? "it" : "they"} won't be included.`
              : `${savedCount} score${savedCount === 1 ? "" : "s"} will be sent for review. You can still edit until it's approved.`}
        </p>
      </div>

      {/* No confirmation step. Submitting is reversible — the sheet stays
          editable right up until an admin approves it — and a dialog guarding a
          reversible action is friction rather than safety. The consequence is
          stated above the button instead. */}
      <Button
        type="button"
        onClick={() => submit.mutate({ id: submission.id })}
        disabled={nothingToSend || submit.isPending}
        className="shrink-0"
      >
        <Send className="size-3.5 mr-1.5" />
        {submit.isPending ? "Sending…" : "Submit for review"}
      </Button>
    </div>
  );
}
