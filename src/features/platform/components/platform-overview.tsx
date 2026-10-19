"use client";

import { ErrorState } from "@/components/shared/error-state";
import { formatNaira } from "@/lib/text/format-naira";

import { usePlatformFinancials } from "../hooks/use-platform";
import { buildPlatformReach } from "../lib/platform-reach";
import { AttentionPanel } from "./overview/attention-panel";
import { DemoPipelineCard } from "./overview/demo-pipeline-card";
import { PlatformKpis } from "./overview/platform-kpis";
import { PlatformMix } from "./overview/platform-mix";
import { ReachByState } from "./overview/reach-by-state";
import { SchoolsSnapshot } from "./overview/schools-snapshot";

// The SchoolOS team's home: how big the platform is, where it reaches, and
// what needs doing. Built from routes that already exist — the financials
// payload (every school, with location, levels, students and capacity) plus
// page_size=1 counts for teachers, parents and demo requests. No stats
// endpoint exists; see PROJECT.md for the backend ask that would replace the
// extra counts.
//
// Order is attention-first within each column: the things someone must act on
// (expired schools, new leads) sit above the descriptive cards.
export function PlatformOverview() {
  const { data, isPending, isError, error } = usePlatformFinancials();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading…</p>;
  }
  if (isError || !data) {
    return <ErrorState error={error} resourceLabel="the platform overview" />;
  }

  const reach = buildPlatformReach(data.schools);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Platform</h1>
          <p className="mt-1 text-sm text-n-500">Every school on SchoolOS, at a glance.</p>
        </div>
        {/* Revenue stays visible but secondary — it's a projection, and the
            Revenue screen explains how it's built. */}
        <div className="flex gap-6 text-right text-xs text-n-500">
          <p>
            Projected this term{" "}
            <span className="block font-display text-lg font-bold tabular-nums text-ink">
              {formatNaira(data.estimated_termly_revenue_total)}
            </span>
          </p>
          {/* Collected, not projected — the one figure here that is real money. */}
          <p>
            Result PINs collected{" "}
            <span className="block font-display text-lg font-bold tabular-nums text-ink">
              {formatNaira(data.scratch_card_revenue_total ?? 0)}
            </span>
          </p>
        </div>
      </div>

      <PlatformKpis schoolCount={data.school_count} reach={reach} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-6">
          <AttentionPanel rows={data.schools} />
          <SchoolsSnapshot rows={data.schools} />
        </div>
        <div className="min-w-0 space-y-6">
          <DemoPipelineCard />
          <ReachByState states={reach.states} />
          <PlatformMix reach={reach} schoolCount={data.school_count} />
        </div>
      </div>
    </div>
  );
}
