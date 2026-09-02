import { z } from "zod";

export const brandingSchema = z.object({
  // An S3 object key from the presigned-upload flow, set by ImageUploadField
  // rather than typed — nothing to validate beyond "a string or nothing".
  // Null clears the logo.
  logo_key: z.string().nullable().optional(),
  primary_color: z.string().min(1, "Pick a primary colour"),
  accent_color: z.string().min(1, "Pick an accent colour"),
  motto: z.string().trim().optional(),
});

export type BrandingFormValues = z.infer<typeof brandingSchema>;
