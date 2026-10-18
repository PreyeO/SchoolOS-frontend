import type { ScratchCard } from "../types";

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
  unused: {
    label: "Unused",
    className: "border-grass/30 bg-grass/10 text-grass",
    hint: "Not checked against any student yet.",
  },
  used: {
    label: "Used",
    className: "border-n-200 bg-n-50 text-n-600",
    hint: "Bound to this student for the whole session.",
  },
  locked: {
    label: "Locked",
    className: "border-clay/30 bg-clay/10 text-clay",
    hint: "Five wrong PINs locked it. Regenerate to issue a new card.",
  },
  replaced: {
    label: "Replaced",
    className: "border-n-200 bg-white text-n-400",
    hint: "A new card was issued; this serial no longer works.",
  },
};
