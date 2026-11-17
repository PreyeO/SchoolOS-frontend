import { buildArmOptions } from "@/lib/school/arm-options";
import type { ClassRecord } from "@/lib/school/class-record";

import type { AssignmentReason, CardAssignment, IssuanceBatch } from "../types";

// Why a card was given: a first issue, or a replacement and its cause. Shared
// by the send page and the student's card history so both say the same thing.
export const REASON_LABEL: Record<AssignmentReason, string> = {
  issued: "First card",
  lost: "Replacement: card lost",
  never_arrived: "Replacement: never arrived",
  resend: "Replacement: sent again",
};

const isReplacement = (a: Pick<CardAssignment, "reason">) => a.reason !== "issued";

// "Texted 1 replacement card" rather than "Texted 1 card" when that's what
// the send was (a Replace or a resend is a batch of its own, reason ≠ issued).
export function batchTitle(batch: Pick<IssuanceBatch, "channel" | "student_count" | "assignments">): string {
  const verb = batch.channel === "sms" ? "Texted" : "Printed";
  const n = batch.student_count;
  const all = batch.assignments ?? [];
  const replacement = all.length > 0 && all.every(isReplacement) ? "replacement " : "";
  return `${verb} ${n} ${replacement}card${n === 1 ? "" : "s"}`;
}

// Who a send covered, by NAME where the batch says which class or arm
// (scope_detail ids, resolved against the school's classes). Falls back to a
// plain description while classes load or if one has since been deleted.
export function batchScopeName(
  batch: Pick<IssuanceBatch, "scope" | "student_count" | "scope_detail">,
  classes: ClassRecord[],
): string {
  const d = batch.scope_detail;
  switch (batch.scope) {
    case "school":
      return "Whole school";
    case "class":
      return classes.find((c) => c.id === d?.class_id)?.name ?? "One class";
    case "arm": {
      const options = buildArmOptions(classes).flatMap((g) => g.options);
      return options.find((o) => o.armId === d?.class_arm_id)?.label ?? "One arm";
    }
    case "selection":
      return batch.student_count === 1 ? "1 chosen student" : `${batch.student_count} chosen students`;
  }
}
