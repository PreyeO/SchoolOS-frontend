"use client";

import { Eraser } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";

import type { BulkClearPayload } from "../types";

interface Props {
  classArmId: string;
  date: string;
  armLabel: string;
  // Every student to clear — see clearRegisterStudentIds.
  studentIds: string[];
  // Saved marks the clear will remove, for the confirmation's wording.
  markedCount: number;
  // Why it can't run right now (offline, marks still syncing), or null.
  blockedReason: string | null;
  isPending: boolean;
  onConfirm: (payload: BulkClearPayload) => void;
}

function longDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// For a register taken by mistake — the reported case was a Saturday. Undoes
// the day for this arm as if it was never marked. Names the arm and the full
// date, weekday included, because picking the wrong day is the very mistake
// this exists to fix.
export function ClearRegisterButton({
  classArmId,
  date,
  armLabel,
  studentIds,
  markedCount,
  blockedReason,
  isPending,
  onConfirm,
}: Props) {
  const trigger = (
    <Button
      type="button"
      variant="outline"
      disabled={!!blockedReason || isPending}
      title={blockedReason ?? undefined}
      className="text-destructive"
    >
      <Eraser className="size-3.5" /> {isPending ? "Clearing…" : "Clear register"}
    </Button>
  );

  // A disabled trigger can't open the dialog, and its title says why.
  if (blockedReason || isPending) return trigger;

  return (
    <ConfirmDeleteDialog
      trigger={trigger}
      title={`Clear ${armLabel}'s register for ${longDate(date)}?`}
      description={`This removes ${markedCount} saved mark${markedCount === 1 ? "" : "s"}, as if the register was never taken that day. Unsaved changes on this device are discarded too. The clear is recorded in the audit log.`}
      confirmLabel="Clear register"
      isPending={isPending}
      onConfirm={() =>
        onConfirm({
          class_arm_id: classArmId,
          date,
          student_ids: studentIds,
          cleared_at: new Date().toISOString(),
        })
      }
    />
  );
}
