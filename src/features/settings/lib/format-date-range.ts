// Backend dates are plain "YYYY-MM-DD" — appending a local midnight time avoids
// `new Date()` parsing them as UTC and displaying a day early in negative-offset timezones.
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const sameYear = startDate.getFullYear() === endDate.getFullYear();

  const startLabel = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
  const endLabel = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return `${startLabel} – ${endLabel}`;
}
