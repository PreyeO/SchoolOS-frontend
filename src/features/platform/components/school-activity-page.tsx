"use client";

import { useState } from "react";
import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { formatAuditEntry } from "@/features/audit-logs/lib/format-audit-entry";
import { formatDate } from "@/lib/text/format-date";
import { cn } from "@/lib/utils";

import { useSchoolActivity } from "../hooks/use-school-activity";
import { activityBand, agoLabel, BAND_META, byQuietest, type ActivityBand } from "../lib/school-activity";
import { AccessBadge } from "./access-badge";

const FILTERS: { key: ActivityBand | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "quiet", label: "Gone quiet (30+ days)" },
  { key: "never", label: "No activity" },
  { key: "slowing", label: "Slowing (8–30 days)" },
  { key: "active", label: "Active this week" },
];

// Which schools are actually using SchoolOS, quietest first, so the ones to
// call are at the top. Activity is the school's own latest write (attendance,
// scores, payments, setup…), never a SchoolOS staff action on it.
export function SchoolActivityPage() {
  const { rows, isPending, isError, error, loaded } = useSchoolActivity();
  const [filter, setFilter] = useState<ActivityBand | "all">("all");

  if (isPending) return <p className="text-sm text-n-400" role="status">Loading schools…</p>;
  if (isError) return <ErrorState error={error} resourceLabel="the school list" />;

  const banded = rows.map((r) => ({ ...r, band: activityBand(r.days) }));
  const checking = loaded < rows.length;
  const visible = banded
    .filter((r) => !r.isPending && (filter === "all" || r.band === filter))
    .sort(byQuietest);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">School activity</h1>
        <p className="mt-1 text-sm text-n-500">
          When each school last did something on SchoolOS (took attendance, entered scores, recorded a payment, set
          things up). Quietest first, so you know who to reach out to.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by activity">
        {FILTERS.map((f) => {
          const count = f.key === "all" ? rows.length : banded.filter((r) => !r.isPending && r.band === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                filter === f.key ? "border-primary bg-primary/10 text-ink" : "border-n-200 bg-white text-n-500 hover:text-ink",
              )}
            >
              {f.label} · {count}
            </button>
          );
        })}
      </div>

      {checking && (
        <p className="text-xs text-n-400" role="status">Checking activity: {loaded} of {rows.length} schools…</p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-xl border border-n-200 bg-white p-8 text-center text-sm text-n-400 italic">
          {checking ? "Still checking…" : "No schools in this group."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
                <th className="px-3 py-2.5 font-medium">School</th>
                <th className="px-3 py-2.5 font-medium">Last active</th>
                <th className="px-3 py-2.5 font-medium">Latest activity</th>
                <th className="px-3 py-2.5 font-medium">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {visible.map((r) => (
                <tr key={r.school.id}>
                  <td className="px-3 py-2.5">
                    <Link href={`/platform/schools/${r.school.id}`} className="font-medium text-ink hover:underline">
                      {r.name}
                    </Link>
                    <span className="block text-xs text-n-400">
                      {r.school.city}
                      {r.school.state && `, ${r.school.state}`}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", BAND_META[r.band].className)}>
                      {BAND_META[r.band].label}
                    </span>
                    <span className="mt-1 block text-xs text-n-500">
                      {agoLabel(r.days)}
                      {r.latest && ` · ${formatDate(r.latest.created_at.slice(0, 10))}`}
                    </span>
                  </td>
                  <td className="min-w-56 px-3 py-2.5 text-n-600">
                    {r.isError ? (
                      <span className="text-clay">Couldn&rsquo;t load this school&rsquo;s activity.</span>
                    ) : r.latest ? (
                      formatAuditEntry(r.latest)
                    ) : (
                      <span className="text-n-400">Nothing recorded yet.</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <AccessBadge status={r.school.access_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
