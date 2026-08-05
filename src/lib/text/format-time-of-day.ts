// "10:42 AM" — the audit log's day headers carry the date, so each row only
// needs the time. Kept separate from format-date.ts (whole dates) and
// format-relative-time.ts ("10 minutes ago").
export function formatTimeOfDay(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
