import { z } from "zod";

// Mirrors FeeItemCreateSerializer's own constraints so a bad value is caught
// before the request rather than coming back as a 400: name maxes at 100 chars,
// amount is a positive integer (min_value=1 — a zero-Naira line is not a fee,
// it's an absent one, and a full discount is a waiver, not a ₦0 item).
//
// The upper bound is ours, not the backend's: the column is a PositiveIntegerField
// and would take far more, but a single fee line above ₦100,000,000 is a typo
// every time — most often a kobo amount pasted into a Naira field.
//
// amount is registered with { valueAsNumber: true } so react-hook-form converts
// the input's string before validation. z.coerce would make the schema's input
// and output types diverge and break useForm<FeeItemFormValues> — the same
// reason grading-schema.ts avoids it. An empty number input yields NaN, hence
// the explicit type error rather than zod's "expected number, received nan".
export const feeItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give this fee a name")
    .max(100, "Name must be 100 characters or fewer"),
  amount: z
    .number({ error: "Enter an amount in Naira" })
    .int("Enter a whole number of Naira")
    .min(1, "An amount must be at least ₦1")
    .max(100_000_000, "That looks too large — check the amount"),
});

export type FeeItemFormValues = z.infer<typeof feeItemSchema>;
