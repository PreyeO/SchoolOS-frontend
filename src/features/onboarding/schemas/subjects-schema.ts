import { z } from "zod";

export const subjectsSchema = z.object({
  subjects: z
    .array(z.string().min(1))
    .min(1, "Select at least one subject"),
});

export type SubjectsFormValues = z.infer<typeof subjectsSchema>;
