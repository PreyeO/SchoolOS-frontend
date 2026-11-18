"use client";

import { useState } from "react";
import { Send, TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { useSubmitResult } from "../hooks/use-submission-actions";
import { findIncompleteComponents } from "../lib/incomplete-components";
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
  // The subject's assessments, saved-score counts per assessment, and class
  // size: what the pre-submit warning checks. Computed here rather than in
  // ScoreEntryPage, where handing `components` to a plain function made the
  // React Compiler give up optimising the whole page.
  components: Array<{ id: string; name: string }>;
  enteredByComponent: Map<string, number>;
  studentCount: number;
}

// The step that was missing: entered scores sat in DRAFT forever with no way to
// hand them on. Deliberately separated from Save — saving is routine and
// repeatable, submitting is a handover that puts the sheet in front of an admin.
export function SubmitResultBar({
  submission,
  status,
  savedCount,
  unsavedCount,
  components,
  enteredByComponent,
  studentCount,
}: Props) {
  const submit = useSubmitResult();
  const [confirming, setConfirming] = useState(false);
  const gaps = findIncompleteComponents(components, enteredByComponent, studentCount);

  // SUBMITTED is awaiting review and APPROVED is final; only DRAFT and REJECTED
  // can be sent, which is exactly what the backend accepts.
  if (!submission || status === "submitted" || status === "approved") return null;

  const nothingToSend = savedCount === 0;
  const send = () => submit.mutate({ id: submission.id });

  // Confirmation only when something is missing. A complete sheet goes straight
  // through: submitting stays editable until approval, so a dialog on every
  // submit would be friction. A part-filled one is different. Approval locks
  // the WHOLE subject for the term, so an admin approving early leaves the
  // empty columns unfillable until someone unlocks it; that is worth one stop.
  function handleClick() {
    if (gaps.length > 0) setConfirming(true);
    else send();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-n-200 bg-white px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">
          {status === "rejected" ? "Re-submit for review" : "Submit when every assessment is in"}
        </p>
        <p className="mt-0.5 text-sm text-n-500">
          {nothingToSend
            ? "Enter and save at least one score first."
            : unsavedCount > 0
              ? `${unsavedCount} score${unsavedCount === 1 ? "" : "s"} on screen ${unsavedCount === 1 ? "is" : "are"} still unsaved — save before submitting, or ${unsavedCount === 1 ? "it" : "they"} won't be included.`
              : "Save keeps your work as you go. Submit once all CAs and the exam are entered: after the admin approves, this subject is locked for the term."}
        </p>
      </div>

      <Button type="button" onClick={handleClick} disabled={nothingToSend || submit.isPending} className="shrink-0">
        <Send className="size-3.5 mr-1.5" />
        {submit.isPending ? "Sending…" : "Submit for review"}
      </Button>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <TriangleAlert className="size-4 shrink-0 text-amber" aria-hidden />
              Some scores aren&rsquo;t entered yet
            </AlertDialogTitle>
            <AlertDialogDescription>
              Submitting sends the whole subject for this term, not just the assessments you&rsquo;ve
              done. Once an admin approves it, you can&rsquo;t enter any more scores unless they unlock it.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ul className="divide-y divide-n-100 rounded-lg border border-n-200">
            {gaps.map((gap) => (
              <li key={gap.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
                <span className="font-medium text-ink">{gap.name}</span>
                <span className={gap.entered === 0 ? "text-clay" : "text-n-500"}>
                  {gap.entered === 0 ? "Not started" : `${gap.entered} of ${gap.total} entered`}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-sm text-n-500">
            To keep working, just save your scores. You don&rsquo;t need to submit until everything is in.
          </p>

          {/* Keep entering is the safe default (Radix focuses Cancel first), so
              both are plain app buttons: the dialog's stock Action is red,
              which would read as "delete". */}
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button variant="outline" onClick={send}>
                Submit anyway
              </Button>
            </AlertDialogAction>
            <AlertDialogCancel asChild>
              <Button>Keep entering scores</Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
