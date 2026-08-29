import type { SchoolFinancialRow } from "../types";

// How many days out counts as "expiring soon". A term is ~90 days, so 14 is
// about the point where a renewal conversation has to start rather than being
// noted.
const EXPIRING_SOON_DAYS = 14;

export interface AttentionItem {
  row: SchoolFinancialRow;
  reason: "expired" | "expiring";
  daysLeft: number | null;
}

// Schools a member of staff should actually do something about, worst first.
//
// This is the whole point of the console: everything else on it is a table you
// could get from the database. An expired school can't take a register or
// record a payment — that's a support call already happening, not a metric.
//
// Built from the financials rows because they're the one payload carrying
// access_status for every school at once. The expiry DATES aren't in that
// response, so "expiring soon" can only be derived where a date was passed in
// — hence the dates map, populated from the school detail route where a caller
// has it. With no dates, this still surfaces everything already expired, which
// is the more urgent half.
export function buildAttentionList(
  rows: SchoolFinancialRow[],
  datesById: Map<string, string | null> = new Map(),
): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const row of rows) {
    if (row.access_status === "expired") {
      items.push({ row, reason: "expired", daysLeft: null });
      continue;
    }
    const endsAt = datesById.get(row.school.id);
    if (!endsAt) continue;

    const daysLeft = Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86_400_000);
    if (daysLeft >= 0 && daysLeft <= EXPIRING_SOON_DAYS) {
      items.push({ row, reason: "expiring", daysLeft });
    }
  }

  // Expired before expiring, then soonest first within each.
  return items.sort((a, b) => {
    if (a.reason !== b.reason) return a.reason === "expired" ? -1 : 1;
    return (a.daysLeft ?? 0) - (b.daysLeft ?? 0);
  });
}
