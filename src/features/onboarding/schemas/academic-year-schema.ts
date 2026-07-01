import { z } from "zod";

const termSchema = z
  .object({
    name: z.enum(["FIRST", "SECOND", "THIRD"]),
    start_date: z.string().min(1, "Required"),
    end_date: z.string().min(1, "Required"),
    is_current: z.boolean(),
  })
  .refine((t) => t.end_date > t.start_date, {
    message: "End date must be after the start date",
    path: ["end_date"],
  });

export const academicYearSchema = z
  .object({
    name: z.string().min(3, "e.g. 2025/2026"),
    is_current: z.boolean(),
    terms: z.array(termSchema).length(3),
  })
  .refine((data) => data.terms.filter((t) => t.is_current).length === 1, {
    message: "Mark exactly one term as the current term",
    path: ["terms"],
  });

export type AcademicYearFormValues = z.infer<typeof academicYearSchema>;
