import type { AcademicSessionResponse } from "@/features/onboarding/types";

export interface PeriodOption {
  periodId: string;
  label: string;
  isCurrent: boolean;
}

export interface PeriodOptionGroup {
  sessionId: string;
  sessionName: string;
  options: PeriodOption[];
}

// Every term the school has, grouped under its session, newest session first.
//
// Results screens deliberately have no term picker — a score always belongs to
// the term that is current, and back-dating one is a correction that belongs to
// the unlock workflow. Fees are the opposite: a bursar sets next term's fees
// *before* that term starts, and looks back at a closed term to see who still
// owes. So the period is picked explicitly here, and defaults to current only
// as a starting point.
//
// Sessions are ordered by their earliest term's start_date descending so the
// year being worked on sits at the top; created_at breaks ties and covers a
// session whose terms carry no dates. Terms keep their own `order` within a
// session — that field exists precisely so First/Second/Third don't sort
// alphabetically.
export function buildPeriodOptions(sessions: AcademicSessionResponse[]): PeriodOptionGroup[] {
  return [...sessions]
    .sort((a, b) => sessionStart(b).localeCompare(sessionStart(a)))
    .map((session) => ({
      sessionId: session.id,
      sessionName: session.name,
      options: [...session.periods]
        .sort((a, b) => a.order - b.order)
        .map((period) => ({
          periodId: period.id,
          label: period.name,
          isCurrent: period.is_current,
        })),
    }))
    .filter((group) => group.options.length > 0);
}

function sessionStart(session: AcademicSessionResponse): string {
  const dates = session.periods.map((p) => p.start_date).filter(Boolean);
  return dates.length > 0 ? dates.reduce((a, b) => (a < b ? a : b)) : session.created_at;
}

// The term marked current, if any. Exactly one period across all sessions
// carries is_current — the backend unsets the previous one on every change —
// but nothing guarantees one exists at all, hence the null.
export function currentPeriodId(sessions: AcademicSessionResponse[]): string | null {
  return sessions.flatMap((s) => s.periods).find((p) => p.is_current)?.id ?? null;
}

// "First Term · 2025/2026" — the same session-qualified shape TermBadge shows,
// for copy that names a term outside the picker that selected it.
export function periodLabel(sessions: AcademicSessionResponse[], periodId: string | null): string | null {
  if (!periodId) return null;
  const match = sessions
    .flatMap((session) => session.periods.map((period) => ({ session, period })))
    .find((entry) => entry.period.id === periodId);
  return match ? `${match.period.name} · ${match.session.name}` : null;
}
