// created_at/expires_at are full ISO datetimes (unlike academic period dates,
// which are date-only) — Date already parses these correctly, no timezone
// workaround needed.
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
