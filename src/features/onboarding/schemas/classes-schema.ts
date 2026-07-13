import { z } from "zod";

const armSchema = z.object({
  name: z.string().min(1, "Required"),
});

const classSchema = z.object({
  name: z.string().min(1, "Required"),
  level: z.string().min(1, "Required"),
  arms: z.array(armSchema).min(1, "Add at least one arm"),
});

export const classesSchema = z
  .object({
    classes: z.array(classSchema).min(1, "Add at least one class"),
  })
  .superRefine((data, ctx) => {
    const seenClassNames = new Set<string>();
    data.classes.forEach((cls, i) => {
      const key = cls.name.trim().toLowerCase();
      if (seenClassNames.has(key)) {
        ctx.addIssue({ code: "custom", message: "Duplicate class name", path: ["classes", i, "name"] });
      } else {
        seenClassNames.add(key);
      }

      const seenArmNames = new Set<string>();
      cls.arms.forEach((arm, j) => {
        const armKey = arm.name.trim().toLowerCase();
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
