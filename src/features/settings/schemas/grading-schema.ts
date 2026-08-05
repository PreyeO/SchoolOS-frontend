import { z } from "zod";

// Numeric fields are registered with { valueAsNumber: true } (see the row
// components), so react-hook-form itself converts the input's string value
// before validation — using z.coerce here instead would make the resolver's
// input/output types diverge and break useForm<GradingSystemFormValues>.
// An empty number input yields NaN, so each one states its own type error
// rather than surfacing zod's default "expected number, received nan".
const componentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name must be 50 characters or fewer"),
  max_obtainable: z
    .number({ error: "Enter a score" })
    .int("Score must be a whole number")
    .min(1, "Score must be at least 1")
    .max(100, "Score can't be more than 100"),
});

const rangeSchema = z.object({
  grade: z.string().trim().min(1, "Grade is required").max(10, "Grade must be 10 characters or fewer"),
  min_score: z
    .number({ error: "Enter a min score" })
    .int("Min score must be a whole number")
    .min(0, "Min score can't be negative")
    .max(100, "Min score can't be more than 100"),
  max_score: z
    .number({ error: "Enter a max score" })
    .int("Max score must be a whole number")
    .min(0, "Max score can't be negative")
    .max(100, "Max score can't be more than 100"),
  remark: z.string().trim().min(1, "Remark is required").max(50, "Remark must be 50 characters or fewer"),
});

// Mirrors academic/services.py's _validate_grade_components_data /
// _validate_grade_ranges_data rule for rule, so a school sees a specific,
// fixable message instead of round-tripping a 400. Field limits match the
// serializers' max_length/min_value/max_value exactly.
export const gradingSystemSchema = z
  .object({
    level: z.string().min(1, "Choose a school level"),
    components: z.array(componentSchema).min(1, "Add at least one component"),
    ranges: z.array(rangeSchema).min(1, "Add at least one grade range"),
  })
  .superRefine((data, ctx) => {
    const total = data.components.reduce((sum, c) => sum + c.max_obtainable, 0);
    if (total !== 100) {
      ctx.addIssue({
        code: "custom",
        message: `Component scores must add up to 100 — they currently total ${total}.`,
        path: ["components"],
      });
    }

    const componentNames = new Set<string>();
    data.components.forEach((c, i) => {
      const key = c.name.trim().toLowerCase();
      if (componentNames.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: "Another component already uses this name",
          path: ["components", i, "name"],
        });
      } else {
        componentNames.add(key);
      }
    });

    const gradeNames = new Set<string>();
    data.ranges.forEach((r, i) => {
      if (r.min_score > r.max_score) {
        ctx.addIssue({
          code: "custom",
          message: "Min score can't be higher than max score",
          path: ["ranges", i, "min_score"],
        });
      }

      const key = r.grade.trim().toLowerCase();
      if (gradeNames.has(key)) {
        ctx.addIssue({ code: "custom", message: "Another range already uses this grade", path: ["ranges", i, "grade"] });
      } else {
        gradeNames.add(key);
      }
    });

    const ordered = [...data.ranges].sort((a, b) => a.min_score - b.min_score);
    if (ordered[0]?.min_score !== 0) {
      ctx.addIssue({ code: "custom", message: "Your lowest grade range must start at 0.", path: ["ranges"] });
    }
    if (ordered[ordered.length - 1]?.max_score !== 100) {
      ctx.addIssue({ code: "custom", message: "Your highest grade range must end at 100.", path: ["ranges"] });
    }
    for (let i = 1; i < ordered.length; i++) {
      const prev = ordered[i - 1];
      const curr = ordered[i];
      if (curr.min_score !== prev.max_score + 1) {
        ctx.addIssue({
          code: "custom",
          message: `Grade ranges can't have gaps or overlaps — there's a break between ${prev.max_score} and ${curr.min_score}.`,
          path: ["ranges"],
        });
        break;
      }
    }
  });

export type GradingSystemFormValues = z.infer<typeof gradingSystemSchema>;
