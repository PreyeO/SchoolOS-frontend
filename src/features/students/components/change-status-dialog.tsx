"use client";

import { useState } from "react";

import { ReasonDialog } from "@/components/shared/reason-dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { useBulkUpdateStudentStatus } from "../hooks/use-student-lifecycle";
import { commonTargets, isTerminalStatus } from "../lib/enrollment-status";
import { enrollmentStatusLabel } from "../lib/labels";
import type { EnrollmentStatus } from "../types";

interface Props {
  trigger: React.ReactNode;
  // One entry per student. Statuses decide which targets are offered — the
  // endpoint is all-or-nothing, so only moves legal for EVERY row are listed.
  students: { id: string; status: EnrollmentStatus }[];
  // Names the subject in the title: a student's name, or "3 students".
  subject: string;
  onDone?: () => void;
}

export function ChangeStatusDialog({ trigger, students, subject, onDone }: Props) {
  const [target, setTarget] = useState<EnrollmentStatus | "">("");
  const update = useBulkUpdateStudentStatus();
  const targets = commonTargets(students.map((s) => s.status));

  async function confirm(reason: string) {
    if (!target) return;
    await update.mutateAsync({ status: target, reason, student_ids: students.map((s) => s.id) });
    onDone?.();
  }

  return (
    <ReasonDialog
      trigger={trigger}
      title={`Change status — ${subject}`}
      confirmLabel="Change status"
      isPending={update.isPending}
      canConfirm={target !== ""}
      destructive={target !== "" && isTerminalStatus(target)}
      onOpenChange={(open) => open && setTarget("")}
      onConfirm={confirm}
      reasonPlaceholder="e.g. Family relocated to Abuja"
      description="This is how a student leaves the school. Their results, attendance and fee history stay on record."
    >
      <div className="space-y-1.5">
        <Label htmlFor="status-target">New status</Label>
        <Select
          id="status-target"
          value={target}
          onChange={(e) => setTarget(e.target.value as EnrollmentStatus | "")}
        >
          <option value="">Choose a status</option>
          {targets.map((s) => (
            <option key={s} value={s}>
              {enrollmentStatusLabel(s)}
            </option>
          ))}
        </Select>
        {target !== "" && isTerminalStatus(target) ? (
          // The one thing an admin must know before confirming: there is no
          // undo, and re-admission later means a brand-new profile.
          <p className="rounded-md border border-amber/40 bg-amber/10 px-2.5 py-2 text-xs text-ink">
            <strong>{enrollmentStatusLabel(target)}</strong> is permanent. They can&rsquo;t be
            enrolled, promoted, marked present or scored again, and they leave the current
            class list. If they ever come back, they&rsquo;ll need a new profile with a new
            admission number.
          </p>
        ) : target === "suspended" ? (
          <p className="text-xs text-n-400">
            Suspended students stay on the class list and are still billed. You can set them
            back to Enrolled later.
          </p>
        ) : null}
      </div>
    </ReasonDialog>
  );
}
