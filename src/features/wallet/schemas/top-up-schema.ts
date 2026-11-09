import { z } from "zod";

// Bounds come from GET /api/wallet/ (live server settings), so the schema is
// built per render rather than hardcoded. The ₦100 minimum charge is a server
// constant the API doesn't expose; its 400 message is toasted as written.
export function makeTopUpSchema(min: number, max: number) {
  return z.object({
    credits: z
      .number({ error: "Enter how many credits" })
      .int("Whole credits only")
      .min(min, `At least ${min.toLocaleString()} credits`)
      .max(max, `At most ${max.toLocaleString()} credits per top-up`),
  });
}

export type TopUpValues = z.infer<ReturnType<typeof makeTopUpSchema>>;
