// Backend dates are plain "YYYY-MM-DD" — appending a local midnight time avoids
// new Date() parsing them as UTC and displaying a day early in negative-offset timezones.
export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
