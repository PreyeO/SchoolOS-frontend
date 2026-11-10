import type { ActionMeta } from "../action-catalog-data";

// Result cards (backend scratch_cards/). Reprs read from the call sites on
// 2026-11-10, not guessed:
// - issued / reissued / bound: "SERIAL → ADMISSION_NO"
// - generated: "SERIAL" (one row per card in a purchase)
// - locked: ScratchCard.__str__, "SERIAL — School"
// - purchase.initiated: "3 card(s) — 2026/2027"
// - purchase.verified: CardPurchase.__str__, "3 card(s) — School (successful)"
// The model reprs use " — School", not " @ School", so the formatter's school
// stripping never fires on them; beforeDash drops it here instead.
//
// bound and locked have NO actor (they happen at the public checker), so they
// render after "System" and must read as something that happened.
const beforeDash = (t: string) => t.split(" — ")[0];

export const CARD_ACTIONS: Record<string, ActionMeta> = {
  "scratch_card_purchase.initiated": { category: "cards", rest: (t) => `started a result card purchase: ${t}` },
  "scratch_card_purchase.verified": { category: "cards", rest: (t) => `paid for a result card purchase: ${beforeDash(t)}` },
  "scratch_card.generated": { category: "cards", rest: (t) => `received result card ${t}` },
  "scratch_card.issued": { category: "cards", rest: (t) => `issued result card ${t}` },
  "scratch_card.reissued": { category: "cards", rest: (t) => `replaced result card ${t}` },
  "scratch_card.bound": { category: "cards", rest: (t) => `linked result card ${t} at its first result check` },
  "scratch_card.locked": { category: "cards", rest: (t) => `locked result card ${beforeDash(t)} after five wrong PINs` },
  // "refund <uuid>" or "resend <uuid>": the id helps nobody on screen.
  "message.resolved": {
    category: "cards",
    rest: (t) => (t.startsWith("refund") ? "marked a card text failed and refunded its credits" : "sent a card text again"),
  },
};
