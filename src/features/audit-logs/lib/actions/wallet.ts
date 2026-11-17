import type { ActionMeta } from "../action-catalog-data";

// SMS wallet (backend payments/) and parent numbers (backend messaging/).
// Reprs read from the call sites on 2026-11-10:
// - wallet.debited: "-12 credits (debit:issuance:<uuid>)"
// - wallet.refunded: "+3 credits (refund:<uuid>)"
// - wallet.adjusted: "-20 credits — <reason>" (actor is SchoolOS staff)
// - wallet_topup.*: "50 credits (₦500)"
// - guardian_contact.created: "Name (ADM)", or "Name (ADM) (bulk import)"
// - guardian_contact.updated / deleted: "Name"
// The machine references in parentheses are dropped; only the amount reads.

// "-12 credits (…)" → "12 credits". Falls back to the raw text.
function credits(t: string): string {
  const match = t.match(/[+-]?(\d+) credits?/);
  if (!match) return t;
  return `${match[1]} credit${match[1] === "1" ? "" : "s"}`;
}

export const WALLET_ACTIONS: Record<string, ActionMeta> = {
  "wallet_topup.initiated": { category: "wallet", rest: (t) => `started an SMS credit top-up of ${t}` },
  "wallet_topup.verified": { category: "wallet", rest: (t) => `paid for an SMS credit top-up of ${t}` },
  "wallet.debited": { category: "wallet", rest: (t) => `spent ${credits(t)} on result card texts` },
  "wallet.refunded": { category: "wallet", rest: (t) => `got ${credits(t)} back for a text that failed` },
  "wallet.adjusted": {
    category: "wallet",
    rest: (t) => {
      const [amount, ...reason] = t.split(" — ");
      const verb = amount.trim().startsWith("-") ? "removed" : "added";
      return `${verb} ${credits(amount)} (SchoolOS adjustment${reason.length ? `: ${reason.join(" — ")}` : ""})`;
    },
  },

  "guardian_contact.created": { category: "contacts", rest: (t) => `added parent number ${t}` },
  "guardian_contact.updated": { category: "contacts", rest: (t) => `updated parent number ${t}` },
  "guardian_contact.deleted": { category: "contacts", rest: (t) => `removed parent number ${t}` },
};
