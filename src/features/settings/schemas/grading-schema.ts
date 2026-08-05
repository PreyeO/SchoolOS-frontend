import { z } from "zod";

// Numeric fields are registered with { valueAsNumber: true } (see the row
// components), so react-hook-form itself converts the input's string value
// before validation — using z.coerce here instead would make the resolver's
// input/output types diverge and break useForm<GradingSystemFormValues>.
const componentSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  max_obtainable: z.number().int().min(1, "Must be at least 1").max(100),
});

const rangeSchema = z.object({
  grade: z.string().trim().min(1, "Required"),
  min_score: z.number().int().min(0).max(100),
  max_score: z.number().int().min(0).max(100),
  remark: z.string().trim().min(1, "Required"),
});

// Mirrors academic/services.py's _validate_grade_components_data /
// _validate_grade_ranges_data exactly, so a school catches a bad split or a
// gap in coverage before submitting rather than round-tripping a 400.
export const gradingSystemSchema = z
  .object({
    level: z.string().min(1, "Required"),
    name: z.string().trim().max(100).optional(),
    components: z.array(componentSchema).min(1, "Add at least one component"),
    ranges: z.array(rangeSchema).min(1, "Add at least one grade range"),
  })
  .superRefine((data, ctx) => {
    const total = data.components.reduce((sum, c) => sum + c.max_obtainable, 0);
    if (total !== 100) {
      ctx.addIssue({
        code: "custom",
        message: `Component scores must add up to 100 — currently ${total}.`,
        path: ["components"],
      });
    }

    const componentNames = new Set<string>();
    data.components.forEach((c, i) => {
      const key = c.name.trim().toLowerCase();
      if (componentNames.has(key)) {
        ctx.addIssue({ code: "custom", message: "Duplicate component name", path: ["components", i, "name"] });
      } else {
        componentNames.add(key);
      }
    });

    data.ranges.forEach((r, i) => {
      if (r.min_score > r.max_score) {
        ctx.addIssue({
          code: "custom",
          message: "Min score can't exceed max score",
          path: ["ranges", i, "min_score"],
        });
      }
    });

    const gradeNames = new Set<string>();
    data.ranges.forEach((r, i) => {
      const key = r.grade.trim().toLowerCase();
      if (gradeNames.has(key)) {
        ctx.addIssue({ code: "custom", message: "Duplicate grade", path: ["ranges", i, "grade"] });
      } else {
        gradeNames.add(key);
      }
    });

    const ordered = [...data.ranges].sort((a, b) => a.min_score - b.min_score);
    if (ordered[0]?.min_score !== 0) {
      ctx.addIssue({ code: "custom", message: "Grade ranges must start at 0", path: ["ranges"] });
    }
    if (ordered[ordered.length - 1]?.max_score !== 100) {
      ctx.addIssue({ code: "custom", message: "Grade ranges must end at 100", path: ["ranges"] });
    }
    for (let i = 1; i < ordered.length; i++) {
      const prev = ordered[i - 1];
      const curr = ordered[i];
      if (curr.min_score !== prev.max_score + 1) {
        ctx.addIssue({
          code: "custom",
          message: `Grade ranges must be contiguous with no gaps or overlaps (break between ${prev.max_score} and ${curr.min_score})`,
          path: ["ranges"],
        });
        break;
      }
    }
  });

export type GradingSystemFormValues = z.infer<typeof gradingSystemSchema>;
