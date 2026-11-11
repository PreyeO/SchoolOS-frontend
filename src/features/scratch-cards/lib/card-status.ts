import { formatTimestamp } from "@/lib/text/format-timestamp";

import type { ScratchCard } from "../types";

// One line saying where a card is. `student` on a card is the student it got
// LOCKED to at its first result check, not who it was given to, so "No
// student yet" read as a contradiction next to "Given to a student"
// (reported 2026-11-11). The row doesn't carry who an issued card was given
// to; the student's page and the send page do.
export function cardWhereLine(
  card: Pick<ScratchCard, "is_revoked" | "revoked_at" | "student" | "active_assignment" | "pins_revealed_at">,
): string {
  if (card.is_revoked) return card.revoked_at ? `Replaced ${formatTimestamp(card.revoked_at)}` : "Replaced";
  if (card.student) {
    return `Used by ${card.student.user.first_name} ${card.student.user.last_name} · ${card.student.admission_number}`;
  }
  if (card.active_assignment) return "Given to a student · no results checked yet";
  if (card.pins_revealed_at) return "Anonymous printed slip · no results checked yet";
  return "In stock · not given out yet";
}

// What the status and the line above can't carry: wrong PIN tries so far,
// before the 5-strike lock (an early warning).
export const LOCK_AFTER = 5;

export function cardNotes(card: Pick<ScratchCard, "is_revoked" | "is_locked" | "failed_attempts">): string[] {
  const notes: string[] = [];
  if (!card.is_revoked && !card.is_locked && card.failed_attempts > 0) {
    const n = card.failed_attempts;
    notes.push(`${n} wrong PIN ${n === 1 ? "try" : "tries"} (locks at ${LOCK_AFTER})`);
  }
  return notes;
}

export type CardStatus = "unused" | "used" | "locked" | "replaced";

// One word for where a card stands, checked in order of finality: a replaced
// card is dead whatever else is true, a locked one can't be used even if it
// was bound, and only then does "used" (bound to a student) apply.
export function cardStatus(card: Pick<ScratchCard, "is_revoked" | "is_locked" | "student">): CardStatus {
  if (card.is_revoked) return "replaced";
  if (card.is_locked) return "locked";
  if (card.student) return "used";
  return "unused";
}

export const CARD_STATUS_META: Record<CardStatus, { label: string; className: string; hint: string }> = {
  // Not "Unused": the "In stock" filter means something narrower (not yet
  // issued either), and an issued card waiting for its first check is here too.
  unused: {
    label: "Not used yet",
    className: "border-grass/30 bg-grass/10 text-grass",
    hint: "Nobody has checked a result with it yet.",
  },
  used: {
    label: "Used",
    className: "border-n-200 bg-n-50 text-n-600",
    hint: "Bound to this student for the whole session.",
  },
  locked: {
    label: "Locked",
    className: "border-clay/30 bg-clay/10 text-clay",
    hint: "Five wrong PINs locked it. Replace it to give the student a new card.",
  },
  replaced: {
    label: "Replaced",
    className: "border-n-200 bg-white text-n-400",
    hint: "A new card was issued; this serial no longer works.",
  },
};
