"use client";

import type { ResultSubmission } from "../types";
import { ReviewActionDialog } from "./review-action-dialog";

export type ReviewAction = { kind: "reject" | "unlock"; submission: ResultSubmission };

interface Props {
  action: ReviewAction | null;
  onClose: () => void;
  isRejecting: boolean;
  isUnlocking: boolean;
  onReject: (comment: string) => Promise<unknown>;
  onUnlock: (reason: string) => Promise<unknown>;
}

// Both ways an admin sends work back, kept together because they're the same
// dialog with different stakes.
//
// Send-back is the teacher's turn again and the note is what they read, so it
// asks what needs fixing. Unlock reopens something already approved, which is a
// correction to a decision — so its reason goes to the audit log rather than to
// a person, and it isn't styled destructive.
export function ReviewActionDialogs({
  action,
  onClose,
  isRejecting,
  isUnlocking,
  onReject,
  onUnlock,
}: Props) {
  const subject = action?.submission.subject_name ?? "";

  return (
    <>
      <ReviewActionDialog
        open={action?.kind === "reject"}
        onOpenChange={(next) => !next && onClose()}
        title={`Send ${subject} back?`}
        description="The teacher can edit and re-submit. Your note is what they'll see, so say what needs changing."
        label="What needs fixing"
        placeholder="e.g. Exam scores for three students are missing."
        confirmLabel="Send back"
        required
        destructive
        isPending={isRejecting}
        onConfirm={onReject}
      />

      <ReviewActionDialog
        open={action?.kind === "unlock"}
        onOpenChange={(next) => !next && onClose()}
        title={`Unlock ${subject}?`}
        description="This reopens the subject for editing and returns it to awaiting review. The reason is recorded in the audit log."
        label="Reason for unlocking"
        placeholder="e.g. Two scores were transposed and need correcting."
        confirmLabel="Unlock"
        required
        isPending={isUnlocking}
        onConfirm={onUnlock}
      />
    </>
  );
}
