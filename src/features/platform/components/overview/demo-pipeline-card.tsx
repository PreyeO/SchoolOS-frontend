"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";

import { useDemoPipeline } from "../../hooks/use-platform-stats";
import { OverviewCard } from "./overview-card";

const STAGES = [
  { key: "pending", label: "New", hint: "waiting for a call" },
  { key: "contacted", label: "Contacted", hint: "in conversation" },
  { key: "converted", label: "Converted", hint: "became schools" },
  { key: "declined", label: "Declined", hint: "not a fit" },
] as const;

// Demo requests by stage — where the next schools come from. "New" is the
// one that needs a person to act, so it's the only figure given emphasis.
export function DemoPipelineCard() {
  const { data, isPending } = useDemoPipeline();
  const total = data ? Object.values(data).reduce((a, b) => a + b, 0) : 0;

  return (
    <OverviewCard title="Demo requests" icon={Inbox} link={{ href: "/platform/demo-requests", label: "Open" }}>
      {isPending ? (
        <p className="px-4 py-6 text-sm text-n-400" role="status">Loading…</p>
      ) : data === null || data === undefined ? (
        <p className="px-4 py-6 text-sm text-n-500">Demo requests aren&rsquo;t visible to your role.</p>
      ) : (
        <div className="space-y-3 px-4 py-4">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STAGES.map((s) => (
              <div key={s.key} className="min-w-0">
                <dt className="text-xs text-n-500">{s.label}</dt>
                <dd
                  className={`font-display text-xl font-bold tabular-nums ${s.key === "pending" && data.pending > 0 ? "text-amber" : "text-ink"}`}
                >
                  {data[s.key]}
                </dd>
                <dd className="text-[11px] text-n-400">{s.hint}</dd>
              </div>
            ))}
          </dl>
          {total > 0 && (
            <p className="text-xs text-n-500">
              {Math.round((data.converted / total) * 100)}% of {total} requests have become schools.
            </p>
          )}
          {data.pending > 0 && (
            <Link href="/platform/demo-requests" className="inline-block text-xs font-medium text-primary hover:underline">
              Call the {data.pending} new {data.pending === 1 ? "lead" : "leads"}
            </Link>
          )}
        </div>
      )}
    </OverviewCard>
  );
}
