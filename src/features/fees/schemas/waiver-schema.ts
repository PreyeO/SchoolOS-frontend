import { z } from "zod";

// StudentFeeWaiverCreateSerializer takes an optional, unbounded `reason`. The
// cap here is ours: the field is a TextField server-side, but a waiver reason is
// a one-line justification for an audit trail, not a case file.
export const waiverSchema = z.object({
  reason: z.string().trim().max(500, "Keep the reason under 500 characters"),
});

export type WaiverFormValues = z.infer<typeof waiverSchema>;
