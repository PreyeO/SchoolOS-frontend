"use client";

import Link from "next/link";
import { ArrowRight, Building2, TrendingUp, TriangleAlert } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { formatNaira } from "@/lib/text/format-naira";

import { usePlatformFinancials } from "../hooks/use-platform";
import { buildAttentionList } from "../lib/attention";
import { AccessBadge } from "./access-badge";

export function PlatformOverview() {
  const { data, isPending, isError, error } = usePlatformFinancials();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading…</p>;
  }
  if (isError || !data) {
    return <ErrorState error={error} resourceLabel="the platform overview" />;
  }

  // No dates map: the financials payload carries access_status but not the
  // expiry dates, so this surfaces already-expired schools only. Adding
  // "expiring soon" would need a date per school, which today means one detail
  // request each — not worth it on a dashboard.
  const attention = buildAttentionList(data.schools);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Platform</h1>
        <p className="mt-1 text-sm text-n-500">Every school on SchoolOS, at a glance.</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Schools" value={String(data.school_count)} icon={Building2} />
        <Kpi
          label="Subscribed"
          value={`${data.subscribed_school_count} of ${data.school_count}`}
          icon={TrendingUp}
        />
        <Kpi
          label="Projected termly"
          value={formatNaira(data.estimated_termly_revenue_total)}
          icon={TrendingUp}
          hint="Includes unsubscribed schools at list price"
        />
      </dl>

      <section className="rounded-xl border border-n-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-n-100 px-4 py-3">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
            <TriangleAlert className="size-4 text-amber" />
            Needs attention
          </h2>
          <Link
            href="/platform/schools"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            All schools
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {attention.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-n-400 italic">
            Every school has active access.
          </p>
        ) : (
          <ul className="divide-y divide-n-100">
            {attention.map(({ row, reason, daysLeft }) => (
              <li key={row.school.id}>
                <Link
                  href={`/platform/schools/${row.school.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-n-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {row.school.name}
                    </span>
                    <span className="block truncate text-xs text-n-500">
                      {row.student_count} student{row.student_count === 1 ? "" : "s"} ·{" "}
                      {row.school.city}
                    </span>
                  </span>
                  {reason === "expiring" && daysLeft !== null && (
                    <span className="shrink-0 text-xs text-amber">
                      {daysLeft === 0 ? "Ends today" : `${daysLeft}d left`}
                    </span>
                  )}
                  <AccessBadge status={row.access_status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: typeof Building2;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-4">
      <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums text-ink">{value}</dd>
      {hint && <dd className="mt-0.5 text-[11px] text-n-500">{hint}</dd>}
    </div>
  );
}
