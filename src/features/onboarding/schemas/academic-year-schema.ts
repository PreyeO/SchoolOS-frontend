import { z } from "zod";

const periodSchema = z
  .object({
    name: z.string().min(1, "Required"),
    start_date: z.string().min(1, "Required"),
    end_date: z.string().min(1, "Required"),
    is_current: z.boolean(),
  })
  .refine((p) => p.end_date > p.start_date, {
    message: "End date must be after the start date",
    path: ["end_date"],
  });

export const academicYearSchema = z
  .object({
    name: z.string().min(3, "e.g. 2025/2026"),
    periods: z.array(periodSchema).min(1, "Add at least one term"),
  })
  .refine((data) => data.periods.filter((p) => p.is_current).length === 1, {
    message: "Mark exactly one term as the current term",
    path: ["periods"],
  });

export type AcademicYearFormValues = z.infer<typeof academicYearSchema>;
export type PeriodFormValues = z.infer<typeof periodSchema>;
