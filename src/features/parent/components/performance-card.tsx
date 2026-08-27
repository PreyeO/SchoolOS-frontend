"use client";

import { TrendingUp } from "lucide-react";

import { ordinal } from "@/lib/text/ordinal";

import type { TermPoint } from "../hooks/use-child-performance";
import { PerformanceTrendChart } from "./charts/performance-trend-chart";

interface Props {
  points: TermPoint[];
  sessionName: string | null;
  termCount: number;
  isPending: boolean;
}

// The trend, plus the honesty about what's in it.
//
// One point is not a trend, so below two the chart is replaced by a line of
// text. Drawing a single dot on an axis implies a shape that isn't there, and
// early in a session exactly one term is published — the common case, not an
// edge case.
export function PerformanceCard({ points, sessionName, termCount, isPending }: Props) {
  const hidden = termCount - points.length;

  return (
    <section className="rounded-xl border border-n-200 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <TrendingUp className="size-4 text-n-400" />
          Progress
        </h2>
        {sessionName && <p className="text-xs text-n-500">{sessionName}</p>}
      </div>

      {isPending ? (
        <p className="py-8 text-center text-sm text-n-400" role="status">
          Loading results…
        </p>
      ) : points.length === 0 ? (
        <p className="py-8 text-center text-sm text-n-400 italic">
          No published results this session yet.
        </p>
      ) : points.length === 1 ? (
        <p className="py-6 text-center text-sm text-n-500">
          <span className="font-display text-2xl font-bold text-ink">{points[0].average}%</span>
          <span className="mt-1 block">
            in {points[0].label}
            {points[0].position !== null && <> · {ordinal(points[0].position)} in class</>}
          </span>
          <span className="mt-1 block text-xs text-n-400">
            A trend appears once a second term is published.
          </span>
        </p>
      ) : (
        <>
          <div className="mt-2">
            <PerformanceTrendChart data={points} />
          </div>
          {/* Says why the line may be shorter than the session — an unpublished
              term is absent, not a dip. */}
          {hidden > 0 && (
            <p className="mt-1 text-xs text-n-400">
              {hidden} term{hidden === 1 ? "" : "s"} not published yet.
            </p>
          )}
        </>
      )}
    </section>
  );
}
