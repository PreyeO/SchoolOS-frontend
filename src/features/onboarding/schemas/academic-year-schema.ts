import { z } from "zod";

export const academicYearSchema = z.object({
  name: z.string().min(3, "e.g. 2024/2025"),
  start_date: z.string().min(1, "Required"),
  end_date: z.string().min(1, "Required"),
  term_count: z.union([z.literal(2), z.literal(3)]),
});

export type AcademicYearFormValues = z.infer<typeof academicYearSchema>;
