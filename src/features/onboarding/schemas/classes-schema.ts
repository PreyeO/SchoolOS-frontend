import { z } from "zod";

const classRowSchema = z.object({
  name: z.string().min(1, "Required"),
  section: z
    .string()
    .min(1, "Required")
    .max(3, "Max 3 chars")
    .regex(/^[A-Za-z0-9]+$/, "Letters/numbers only"),
  max_students: z.number().int().min(1, "At least 1"),
});

export const classesSchema = z.object({
  classes: z.array(classRowSchema).min(1, "Add at least one class"),
});

export type ClassesFormValues = z.infer<typeof classesSchema>;
export type ClassRowValues = z.infer<typeof classRowSchema>;
