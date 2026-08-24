import { z } from "zod";

// Mirrors PaymentRecordSerializer plus the one rule the serializer can't express
// on its own: the amount must not exceed what is still owed on this item.
//
// The backend enforces that too, and does it under a row lock so two bursars
// can't both pass a check their sum would break. Building it here as well turns
// the common case — a typo, or a full-amount entry against a part-paid item —
// into an inline message instead of a round-tripped 400. The remaining balance
// is a factory argument rather than a field so it can't drift from the ledger
// row the dialog was opened on.
//
// amount is registered with { valueAsNumber: true }, so no z.coerce — same
// reason as fee-item-schema and grading-schema.
export function buildPaymentSchema(remaining: number) {
  return z.object({
    amount: z
      .number({ error: "Enter the amount received" })
      .int("Enter a whole number of Naira")
      .min(1, "An amount must be at least ₦1")
      .max(remaining, `That's more than the ₦${remaining.toLocaleString("en-NG")} still owed on this fee`),
    method: z.enum(["cash", "bank_transfer", "pos", "cheque"], {
      error: "Choose how the money was received",
    }),
  });
}

export type PaymentFormValues = z.infer<ReturnType<typeof buildPaymentSchema>>;
