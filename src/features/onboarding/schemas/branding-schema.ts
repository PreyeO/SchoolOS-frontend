import { z } from "zod";

export const brandingSchema = z.object({
  // TODO: restore file upload when hosting is ready — logo is a plain URL for now.
  logo: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), "Enter a valid URL starting with http:// or https://"),
  primary_color: z.string().min(1, "Pick a primary colour"),
  accent_color: z.string().min(1, "Pick an accent colour"),
  motto: z.string().trim().optional(),
});

export type BrandingFormValues = z.infer<typeof brandingSchema>;
