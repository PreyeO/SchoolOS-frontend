import { z } from "zod";

const armSchema = z.object({
  // May be blank while editing — blank rows are trimmed out before submit
  // (features/onboarding/lib/prepare-classes-payload.ts), not treated as errors.
  name: z.string(),
});

const classSchema = z.object({
  name: z.string().min(1, "Required"),
  level: z.string().min(1, "Required"),
  // Optional — a class may have zero arms.
  arms: z.array(armSchema),
});

export const classesSchema = z
  .object({
    classes: z.array(classSchema).min(1, "Add at least one class"),
  })
  .superRefine((data, ctx) => {
    const seenClassNames = new Set<string>();
    data.classes.forEach((cls, i) => {
      const key = cls.name.trim().toLowerCase();
      if (key) {
        if (seenClassNames.has(key)) {
          ctx.addIssue({ code: "custom", message: "Duplicate class name", path: ["classes", i, "name"] });
        } else {
          seenClassNames.add(key);
        }
      }

      const seenArmNames = new Set<string>();
      cls.arms.forEach((arm, j) => {
        const armKey = arm.name.trim().toLowerCase();
        if (!armKey) return; // blank rows are dropped before submit, not duplicates
        if (seenArmNames.has(armKey)) {
          ctx.addIssue({
            code: "custom",
            message: "Duplicate arm name in this class",
            path: ["classes", i, "arms", j, "name"],
          });
        } else {
          seenArmNames.add(armKey);
        }
      });
    });
  });

export type ClassesFormValues = z.infer<typeof classesSchema>;
export type ClassFormValues = z.infer<typeof classSchema>;
