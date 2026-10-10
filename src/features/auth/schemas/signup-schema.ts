import { z } from "zod";

import { passwordField } from "@/lib/validations/password";

export const signupSchema = z
  .object({
    first_name: z.string().min(2, "Min 2 characters"),
    last_name: z.string().min(2, "Min 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: passwordField,
    confirm_password: z.string().min(1, "Please confirm your password"),
    phone_number: z.string().optional(),
    // Client-side only — the backend's UserRegistrationSerializer has no field
    // for this, so signup()'s explicit payload construction never sends it.
    // The checkbox is the acceptance record itself; there's nothing to log to
    // the server for it.
    accepted_terms: z.boolean(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((data) => data.accepted_terms, {
    message: "You must accept the Terms of Service and Privacy Policy to continue",
    path: ["accepted_terms"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
