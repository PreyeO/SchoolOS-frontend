import type { AuditLogEntry } from "@/features/audit-logs/types";

// How recently a school did anything itself, read from its audit log.
//
// "Itself" is the point: SchoolOS staff extending a trial or adjusting a wallet
// is logged against the school too, and must not make a dormant school look
// alive. So entries whose actor is a platform admin are skipped. Every school
// write the product cares about is logged (attendance.marked, score.entered,
// payment.recorded…); reads such as a parent checking a result are not, so a
// school whose only use is viewing will look quieter than it is.

export type ActivityBand = "active" | "slowing" | "quiet" | "never";

export const BAND_META: Record<ActivityBand, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-grass/10 text-grass" },
  slowing: { label: "Slowing", className: "bg-amber/15 text-ink" },
  quiet: { label: "Gone quiet", className: "bg-clay/10 text-clay" },
  never: { label: "No activity", className: "bg-n-100 text-n-600" },
};

// Within a week is active, within a month slowing, beyond that quiet.
export function activityBand(days: number | null): ActivityBand {
  if (days == null) return "never";
  if (days <= 7) return "active";
  if (days <= 30) return "slowing";
  return "quiet";
}

export function latestSchoolEntry(entries: AuditLogEntry[], staffUserIds: Set<string>): AuditLogEntry | null {
  return entries.find((e) => !e.actor || !staffUserIds.has(e.actor.id)) ?? null;
}

// Whole calendar days, so "today" is 0 whatever the hour.
export function daysSince(iso: string, now: Date = new Date()): number {
  const start = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.max(0, Math.round((start(now) - start(new Date(iso))) / 86_400_000));
}

export function agoLabel(days: number | null): string {
  if (days == null) return "Never";
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export interface ActivityRow {
  days: number | null;
  name: string;
}

// Quietest first, so the schools to call are at the top: never-active, then
// longest silence, ties by name.
export function byQuietest<T extends ActivityRow>(a: T, b: T): number {
  const da = a.days ?? Number.POSITIVE_INFINITY;
  const db = b.days ?? Number.POSITIVE_INFINITY;
  return da === db ? a.name.localeCompare(b.name) : db - da;
}
