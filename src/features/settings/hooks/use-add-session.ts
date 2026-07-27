"use client";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";
import { createAcademicSession } from "@/features/onboarding/api/onboarding-api";
import type { AcademicYearFormValues } from "@/features/onboarding/schemas/academic-year-schema";

export function useAddSession() {
  return useMutationWithToast(
    (values: AcademicYearFormValues) =>
      createAcademicSession({
        name: values.name,
        periods: values.periods.map((p, i) => ({
          name: p.name,
          order: i + 1,
          start_date: p.start_date,
          end_date: p.end_date,
          is_current: p.is_current,
        })),
      }),
    "Session added",
  );
}
