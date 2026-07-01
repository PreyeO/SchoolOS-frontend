import { z } from "zod";

const classRowSchema = z.object({
  name: z.string().min(1, "Required"),
  arm: z
    .string()
    .min(1, "Required")
    .max(3, "Max 3 chars")
    .regex(/^[A-Za-z0-9]+$/, "Letters/numbers only"),
  max_students: z.number().int().min(1, "At least 1"),
});

export const classesSchema = z
  .object({
    classes: z.array(classRowSchema).min(1, "Add at least one class"),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.classes.forEach((row, i) => {
      const key = `${row.name.trim().toLowerCase()}::${row.arm.trim().toLowerCase()}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: "This class already has this arm",
          path: ["classes", i, "arm"],
        });
      } else {
        seen.add(key);
      }
    });
  });

export type ClassesFormValues = z.infer<typeof classesSchema>;
export type ClassRowValues = z.infer<typeof classRowSchema>;
