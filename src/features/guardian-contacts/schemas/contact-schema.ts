import { z } from "zod";

import { looksLikeNigerianMobile } from "../lib/phone";

// The server re-validates the phone (allocated ranges, no fixed lines) and
// its message is toasted; this only stops an obvious typo first.
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter the parent or guardian's name").max(200, "Too long"),
  phone: z.string().refine(looksLikeNigerianMobile, "Enter a Nigerian mobile number, e.g. 0803 123 4567"),
  is_primary: z.boolean(),
});

export type ContactValues = z.infer<typeof contactSchema>;
