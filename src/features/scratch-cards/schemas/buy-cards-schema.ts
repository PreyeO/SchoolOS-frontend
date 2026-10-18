import { z } from "zod";

// Mirrors InitiateCardPurchaseSerializer: quantity 1–1000, a session id.
export const buyCardsSchema = z.object({
  academic_session_id: z.string().min(1, "Choose the session the cards are for"),
  quantity: z
    .number({ error: "Enter how many cards" })
    .int("Whole cards only")
    .min(1, "At least 1 card")
    .max(1000, "At most 1,000 cards per purchase"),
});

export type BuyCardsValues = z.infer<typeof buyCardsSchema>;
