export const TERM_CODES = ["FIRST", "SECOND", "THIRD"] as const;
export type TermCode = (typeof TERM_CODES)[number];

export const TERM_LABELS: Record<TermCode, string> = {
  FIRST: "First Term",
  SECOND: "Second Term",
  THIRD: "Third Term",
};

export interface DefaultTerm {
  name: TermCode;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

// Sensible Nigerian academic-calendar defaults. The user can edit every date.
export function getDefaultTerms(startYear: number): DefaultTerm[] {
  const y = startYear;
  return [
    { name: "FIRST", start_date: `${y}-09-16`, end_date: `${y}-12-13`, is_current: true },
    { name: "SECOND", start_date: `${y + 1}-01-06`, end_date: `${y + 1}-04-04`, is_current: false },
    { name: "THIRD", start_date: `${y + 1}-04-28`, end_date: `${y + 1}-07-25`, is_current: false },
  ];
}

// The calendar year an academic session begins in (Sept–Dec → this year, else last year).
export function getSessionStartYear(): number {
  const now = new Date();
  const yr = now.getFullYear();
  return now.getMonth() >= 8 ? yr : yr - 1;
}

export function getCurrentAcademicYear(): string {
  const startYear = getSessionStartYear();
  return `${startYear}/${startYear + 1}`;
}
