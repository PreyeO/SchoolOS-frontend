import { z } from "zod";

export const brandingSchema = z.object({
  primary_color: z.string().min(1, "Pick a colour"),
  logo: z.instanceof(File).nullable().optional(),
});

export type BrandingFormValues = z.infer<typeof brandingSchema>;
