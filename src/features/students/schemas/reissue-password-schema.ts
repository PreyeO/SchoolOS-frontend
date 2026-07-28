import { z } from "zod";

// Same strength bar as signup/accept-invite — client-side check ahead of the
// backend's Django password validators (server enforces min 8 either way).
export const reissuePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
});

export type ReissuePasswordFormValues = z.infer<typeof reissuePasswordSchema>;
