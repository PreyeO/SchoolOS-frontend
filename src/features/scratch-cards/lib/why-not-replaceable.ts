import type { ScratchCard } from "../types";

import { cardStatus } from "./card-status";

// What the replace dialog says when the card has no active assignment, so
// there's no named student to reissue it to. Three different situations:
//
// - a printed slip (its purchase's PINs were revealed): it left stock when
//   printed (backend b87df1a), so "issue it later" would be false;
// - genuine stock: never handed out, so there's nothing to replace yet;
// - anything else (bound or locked with no assignment): a slip from a purchase
//   revealed before pins_revealed_at existed, which the server can't tell apart.
export function whyNotReplaceable(
  card: Pick<ScratchCard, "pins_revealed_at" | "is_revoked" | "is_locked" | "student">,
): string {
  if (card.pins_revealed_at) {
    return "This card's PIN was printed when it was bought, without a named student, so it can't be replaced. If a family lost it, issue them a new card from stock.";
  }
  if (cardStatus(card) === "unused") {
    return "This card hasn't been given to anyone yet, so there's nothing to replace. It's in stock, and gets a fresh serial and PIN when you issue it to a student.";
  }
  return "This card was handed out without a named student, so it can't be replaced. Issue the family a new card from stock instead.";
}
