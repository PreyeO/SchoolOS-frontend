import { z } from "zod";

const subjectItemSchema = z.object({
  name: z.string().min(1, "Required"),
  level: z.string().min(1, "Required"),
  is_core: z.boolean(),
});

export const subjectsSchema = z
  .object({
    subjects: z.array(subjectItemSchema).min(1, "Select at least one subject"),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.subjects.forEach((s, i) => {
      const key = `${s.name.trim().toLowerCase()}::${s.level}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate subject "${s.name}" for the same level`,
          path: ["subjects", i, "name"],
        });
      } else {
        seen.add(key);
      }
    });
  });

export type SubjectsFormValues = z.infer<typeof subjectsSchema>;
