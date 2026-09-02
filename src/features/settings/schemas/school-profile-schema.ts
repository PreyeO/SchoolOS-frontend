import { z } from "zod";

// Field-level rules mirror create-school-schema.ts — address/city/phone/email
// are required there and remain required in the School model (blank=False),
// so PATCH would fail full_clean() if cleared here.
export const schoolProfileSchema = z.object({
  name: z.string().min(3, "At least 3 characters"),
  city: z.string().min(2, "At least 2 characters"),
  address: z.string().min(5, "At least 5 characters"),
  phone_number: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
  website: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), "Enter a valid URL starting with http:// or https://"),
  // An S3 object key from the presigned-upload flow, not a URL — the backend
  // renamed School.logo to logo_key and now HEADs the object before saving. The
  // field is set by ImageUploadField and never typed, so there's nothing to
  // validate beyond "a string or nothing"; null clears the logo.
  logo_key: z.string().nullable().optional(),
  primary_color: z.string().min(1, "Pick a primary colour"),
  accent_color: z.string().min(1, "Pick an accent colour"),
  motto: z.string().trim().optional(),
});

export type SchoolProfileFormValues = z.infer<typeof schoolProfileSchema>;
