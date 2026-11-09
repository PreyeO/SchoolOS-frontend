import type { WalletTransaction, WalletTransactionType } from "../types";

// Ledger tabs. Labels describe what happened in the school's words; the
// server's type names (debit, adjustment) are bookkeeping terms.
export const TRANSACTION_TABS: { value: WalletTransactionType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "topup", label: "Top-ups" },
  { value: "debit", label: "Texts sent" },
  { value: "refund", label: "Refunds" },
  { value: "adjustment", label: "Adjustments" },
];

// One line of human text for a ledger row. `reference` is machine-shaped
// (see types.ts), so it's read for its prefix, never shown raw except for a
// top-up's gateway reference, which is what support would ask for.
export function describeTransaction(tx: Pick<WalletTransaction, "type" | "reference" | "note">): {
  label: string;
  detail: string | null;
} {
  switch (tx.type) {
    case "topup":
      return { label: "Top-up", detail: `Paystack ref ${tx.reference}` };
    case "debit":
      return {
        label: tx.reference.startsWith("debit:issuance:") ? "Result card PINs texted" : "Texts sent",
        detail: null,
      };
    case "refund":
      // The server's note is "Failed message - <uuid>"; the uuid helps nobody.
      return { label: "Refund for a text that failed", detail: null };
    case "adjustment":
      return { label: "Adjusted by SchoolOS", detail: tx.note || null };
  }
}

// "+50", "−12" (a real minus sign, so the column lines up), "0".
export function formatSignedCredits(credits: number): string {
  if (credits > 0) return `+${credits.toLocaleString("en-NG")}`;
  if (credits < 0) return `−${Math.abs(credits).toLocaleString("en-NG")}`;
  return "0";
}

export function formatCredits(credits: number): string {
  return `${credits.toLocaleString("en-NG")} credit${credits === 1 ? "" : "s"}`;
}
