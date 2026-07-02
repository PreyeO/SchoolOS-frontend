import { z } from "zod";

export const loginSchema = z.object({
  // Email OR admission number (e.g. MOUAU/EEE/16/93164) — do NOT validate as email.
  identifier: z.string().trim().min(3, "Enter your email or admission number"),
  password: z.string().min(1, "Enter your password"),
  school_slug: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
