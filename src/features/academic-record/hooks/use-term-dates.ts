"use client";

import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";

// The start/end dates of one term, for date-ranged queries.
//
// Kept separate from useTermSelection rather than folded into it: that hook is
// consumed by a dozen screens that only ever need the id and the label, and
// widening its return type for the two attendance screens would make every
// other caller carry fields it ignores. Both read the same cached sessions
// query, so this costs no extra request.
//
// Returns undefined bounds when the school left the dates blank — they're
// required by the create form but not by the API, so a hand-made period can
// lack them. The caller then queries unbounded rather than with a broken range.
export function useTermDates(periodId: string | null): {
  after?: string;
  before?: string;
} {
  const { data: sessions } = useAcademicSessions();

  const period = (sessions ?? [])
    .flatMap((session) => session.periods)
    .find((p) => p.id === periodId);

  return {
    after: period?.start_date || undefined,
    before: period?.end_date || undefined,
  };
}
