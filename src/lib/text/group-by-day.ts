export interface DayGroup<T> {
  key: string;
  label: string;
  items: T[];
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

// Buckets a newest-first list into consecutive same-day runs, so the date can be
// a header instead of being repeated on every row.
//
// Lives in lib/ because two unrelated screens read as a chronology: the audit
// log, and the announcements board. Both get their order from the backend
// (-created_at), and a single pass preserves it both across and within groups —
// so this must NOT be handed an unsorted list, or the same day will open twice.
//
// Generic over anything carrying created_at rather than tied to one feature's
// row type; the audit log's own copy was the original.
export function groupByDay<T extends { created_at: string }>(items: T[]): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];

  for (const item of items) {
    const date = new Date(item.created_at);
    const key = dayKey(date);
    const last = groups[groups.length - 1];

    if (last?.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, label: dayLabel(date), items: [item] });
    }
  }

  return groups;
}
