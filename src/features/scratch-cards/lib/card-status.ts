import { formatTimestamp } from "@/lib/text/format-timestamp";

import type { ScratchCard } from "../types";

// The card's facts that a status word can't carry, as short notes:
// - given to a student but not used yet (active_assignment, nobody bound):
//   otherwise it reads exactly like stock, the confusion behind MWW5-4KLM-LD;
// - wrong PIN tries so far, before the 5-strike lock (an early warning);
// - when a replaced card was replaced.
export const LOCK_AFTER = 5;

export function cardNotes(
  card: Pick<ScratchCard, "is_revoked" | "is_locked" | "student" | "active_assignment" | "failed_attempts" | "revoked_at">,
): string[] {
  const notes: string[] = [];
  if (card.is_revoked && card.revoked_at) notes.push(`Replaced ${formatTimestamp(card.revoked_at)}`);
  if (!card.is_revoked && card.active_assignment && !card.student) notes.push("Given to a student, not used yet");
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
