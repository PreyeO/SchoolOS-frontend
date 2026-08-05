import type { AuditLogEntry } from "../types";

export interface AuditDayGroup {
  key: string;
  label: string;
  entries: AuditLogEntry[];
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (dayKey(date) === dayKey(today)) return "Today";
  if (dayKey(date) === dayKey(yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

// An audit log is read as a chronology, so the date belongs in a header rather
// than repeated on all 25 rows. The backend already orders by -created_at, so a
// single pass preserves that order both across and within groups.
export function groupByDay(entries: AuditLogEntry[]): AuditDayGroup[] {
  const groups: AuditDayGroup[] = [];

  for (const entry of entries) {
    const date = new Date(entry.created_at);
    const key = dayKey(date);
    const last = groups[groups.length - 1];

    if (last?.key === key) {
      last.entries.push(entry);
    } else {
      groups.push({ key, label: dayLabel(date), entries: [entry] });
    }
  }

  return groups;
}
