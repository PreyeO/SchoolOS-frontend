// Backend dates are plain "YYYY-MM-DD" — appending a local midnight time avoids
// new Date() parsing them as UTC and displaying a day early in negative-offset timezones.
//
// Date-only values ONLY. A full ISO timestamp (created_at, marked_at) becomes
// "…ZT00:00:00" here and renders "Invalid Date" — use formatTimestamp for those.
export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// The same output as formatDate, but from a full ISO timestamp (created_at and
// friends). Date parses those correctly on its own, so there's no midnight
// suffix to append — doing so is what produces "…ZT00:00:00" and Invalid Date.
//
// Distinct from formatTimestamp, which also prints the time. Use this where the
// moment is context rather than data: "Account created", "Joined school". The
// hour a record was written is noise on a profile, and precision nobody asked
// for reads as clutter.
export function formatIsoDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// The "YYYY-MM-DD" form <input type="date"> and the backend's date filters both
// expect. Built from local parts rather than toISOString(), which would shift
// the date by a day in negative-offset timezones.
export function toLocalIsoDate(date: Date = new Date()): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
