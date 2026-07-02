import { z } from "zod";

import { nameField } from "./shared";

export const addStudentSchema = z.object({
  first_name: nameField,
  last_name: nameField,
  admission_number: z.string().min(1, "Required"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  gender: z.enum(["male", "female", "other"]),
  date_of_birth: z
    .string()
    .optional()
    .refine((v) => !v || new Date(v) < new Date(), "Date of birth must be in the past"),
  email: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email address"),
});

export type AddStudentFormValues = z.infer<typeof addStudentSchema>;
