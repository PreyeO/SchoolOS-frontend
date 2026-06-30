import { z } from "zod";

const LEVEL_VALUES = [
  "creche",
  "nursery",
  "primary",
  "junior_secondary",
  "senior_secondary",
] as const;

export const createSchoolSchema = z.object({
  name: z.string().min(3, "At least 3 characters"),
  slug: z
    .string()
    .min(2, "At least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only")
    .regex(/^[^-]/, "Cannot start with a hyphen")
    .regex(/[^-]$/, "Cannot end with a hyphen"),
  levels: z
    .array(z.enum(LEVEL_VALUES))
    .min(1, "Select at least one level your school runs"),
  state: z.string().min(1, "Select a state"),
  city: z.string().min(2, "At least 2 characters"),
  address: z.string().min(5, "At least 5 characters"),
  phone_number: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
  student_capacity: z.number().int().min(1, "At least 1"),
});

export type CreateSchoolFormValues = z.infer<typeof createSchoolSchema>;
