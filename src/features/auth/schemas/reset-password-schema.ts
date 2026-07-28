import { z } from "zod";

// Same password strength rule as signup — the backend's Django password
// validators are the authoritative check either way.
export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(6, "Enter the 6-digit code")
      .regex(/^\d{6}$/, "Code must be 6 digits"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
