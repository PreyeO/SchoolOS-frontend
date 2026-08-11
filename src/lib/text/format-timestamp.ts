// "Aug 11, 2026, 8:44 PM" — a whole moment, for created_at style values where
// the time distinguishes rows that share a day (two class moves on the same
// afternoon, say). Kept separate from format-date.ts, which takes plain
// "YYYY-MM-DD" and appends a local midnight — feeding it a full ISO timestamp
// produces "…ZT00:00:00" and an Invalid Date.
export function formatTimestamp(isoString: string): string {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
