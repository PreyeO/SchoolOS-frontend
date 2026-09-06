"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useOverviewStats } from "../hooks/use-overview-stats";
import type { KpiStat } from "../api/dashboard-api";

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };
const TREND_COLOR = { up: "text-grass", down: "text-clay", flat: "text-n-400" };

function KpiCard({ stat }: { stat: KpiStat }) {
  const TrendIcon = TREND_ICON[stat.trend.direction];

  return (
    <div className="rounded-xl border border-n-200 bg-white p-4 space-y-2">
      <p className="text-xs font-medium text-n-500">{stat.label}</p>
      {stat.hasData ? (
        <>
          <p className="font-display text-2xl font-bold text-ink">{stat.value}</p>
          {stat.trend.label && (
            <div className={cn("flex items-center gap-1 text-xs", TREND_COLOR[stat.trend.direction])}>
              {/* Only a real rise or fall gets an arrow. A flat descriptor like
                  "3 of 4 marked" isn't a trend and shouldn't wear one. */}
              {stat.trend.direction !== "flat" && <TrendIcon className="size-3.5" />}
              <span>{stat.trend.label}</span>
            </div>
          )}
        </>
      ) : (
        <p className="pt-1 text-sm text-n-400">No data yet</p>
      )}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-4 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function KpiCards() {
  const { data, isPending, isError, error } = useOverviewStats();

  if (isPending) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Was missing entirely: this render only ever checked isPending, so a
  // rejected query (Students/Staff 403ing for an admin missing
  // view_students/view_staff, before permission was checked client-side
  // below) looked identical to "still loading" — skeletons, forever, which
  // is the exact "keeps trying to load" symptom this was reported as.
  if (isError || !data) {
    return <ErrorState error={error} resourceLabel="the school overview" />;
  }

  const visible = Object.values(data).filter((stat) => stat.permitted);

  if (visible.length === 0) {
    // Every figure needs a permission this admin's role doesn't grant — most
    // often a roleless admin (is_admin persona, no SchoolAdminRole
    // permissions at all). Said plainly rather than an empty grid with no
    // explanation.
    return (
      <p className="rounded-xl border border-n-200 bg-white px-4 py-6 text-center text-sm text-n-500">
        You don&rsquo;t have permission to view the school overview. Ask an administrator to
        grant your role the relevant permissions.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {visible.map((stat) => (
        <KpiCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
