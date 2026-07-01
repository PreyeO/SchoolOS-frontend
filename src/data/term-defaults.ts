export const TERM_COUNT_OPTIONS = [
  { value: 3, label: "3 Terms (recommended)" },
  { value: 2, label: "2 Semesters" },
] as const;

export type TermCount = 2 | 3;

export function getDefaultTermDates(
  startYear: number,
  count: TermCount,
): { name: string; start: string; end: string }[] {
  const y = startYear;
  if (count === 3) {
    return [
      { name: "First Term", start: `${y}-09-01`, end: `${y}-12-15` },
      { name: "Second Term", start: `${y + 1}-01-09`, end: `${y + 1}-03-28` },
      { name: "Third Term", start: `${y + 1}-04-14`, end: `${y + 1}-07-18` },
    ];
  }
  return [
    { name: "First Semester", start: `${y}-09-01`, end: `${y + 1}-01-31` },
    { name: "Second Semester", start: `${y + 1}-02-01`, end: `${y + 1}-06-30` },
  ];
}

export function getCurrentAcademicYear(): string {
  const now = new Date();
  const yr = now.getFullYear();
  return now.getMonth() >= 8 ? `${yr}/${yr + 1}` : `${yr - 1}/${yr}`;
}
