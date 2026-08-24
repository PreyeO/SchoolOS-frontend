import type { ActionMeta } from "../action-catalog-data";

// Fees — structure, money taken, and forgiven amounts.
//
// Every repr here was read off the backend rather than guessed, because
// cleanTargetRepr strips everything before the last ": " and a repr in an
// unexpected shape comes out truncated rather than merely ugly. None of these
// contain ": ", so all of them survive whole.
export const FEES_ACTIONS: Record<string, ActionMeta> = {
  // Falls back to the model's __str__: "Tuition (50000) — JSS 1 / 3rd Term", so
  // the amount, class and term are all already in the target. The sentence only
  // has to supply the verb.
  "fee_item.created": { category: "fees", rest: (t) => `added a fee — ${t}` },
  "fee_item.updated": { category: "fees", rest: (t) => `changed a fee — ${t}` },
  "fee_item.deleted": { category: "fees", rest: (t) => `removed a fee — ${t}` },
  // Distinct from deleted on purpose: the backend deactivates instead of
  // deleting once payments or waivers reference the item, and the log is the one
  // place that difference is recoverable afterwards.
  "fee_item.deactivated": {
    category: "fees",
    rest: (t) => `retired a fee (kept for past receipts) — ${t}`,
  },

  // Explicit repr: "GRN-000452 — ANU/001223139 — Tuition — 20000". Receipt
  // number first, which is what anyone auditing a payment searches for.
  "payment.recorded": { category: "payments", rest: (t) => `recorded a payment — ${t}` },

  // Explicit reprs already read as sentences — "Tuition waived for ANU/001223139"
  // and "Tuition waiver removed for ANU/001223139" — so the verb would be said
  // twice if these repeated it.
  "fee_waiver.created": { category: "payments", rest: (t) => t },
  "fee_waiver.deleted": { category: "payments", rest: (t) => t },
};
