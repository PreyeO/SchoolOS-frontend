import { z } from "zod";

import { passwordField } from "@/lib/validations/password";

import { nameField } from "./shared";

export const addStudentSchema = z.object({
  first_name: nameField,
  last_name: nameField,
  admission_number: z.string().min(1, "Required"),
  password: passwordField,
  gender: z.enum(["male", "female"]),
  date_of_birth: z
    .string()
    .optional()
    .refine((v) => !v || new Date(v) < new Date(), "Date of birth must be in the past"),
  email: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email address"),
  // Required by the backend — adding a student also creates their Enrollment for
  // the current session, and enrollment always targets an arm, never a class.
  class_arm_id: z.string().min(1, "Pick a class"),
});

export type AddStudentFormValues = z.infer<typeof addStudentSchema>;
