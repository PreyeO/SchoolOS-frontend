"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
          <div className={cn("flex items-center gap-1 text-xs", TREND_COLOR[stat.trend.direction])}>
            <TrendIcon className="size-3.5" />
            <span>{stat.trend.label}</span>
          </div>
        </>
      ) : (
        <p className="text-sm text-n-400 pt-1">No data yet</p>
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
  const { data, isPending } = useOverviewStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {isPending || !data
        ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        : Object.values(data).map((stat) => <KpiCard key={stat.label} stat={stat} />)}
    </div>
  );
}
