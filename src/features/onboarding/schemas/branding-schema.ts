import { z } from "zod";

export const brandingSchema = z.object({
  primary_color: z.string().min(1, "Pick a colour"),
  // logo validated by the uploader component; z.any avoids z.instanceof(File) SSR issues
  logo: z.any().optional(),
});

export interface BrandingFormValues {
  primary_color: string;
  logo?: File | null;
}
