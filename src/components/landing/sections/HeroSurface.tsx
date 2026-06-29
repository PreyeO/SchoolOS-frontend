"use client";

import { useCallback, useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

import { HeroFeesPanel } from "./HeroFeesPanel";
import { HeroResultsPanel } from "./HeroResultsPanel";

export type SurfacePhase =
  | "results-0"
  | "results-1"
  | "results-2"
  | "fees-0"
  | "fees-1"
  | "fees-2";

const PHASES: SurfacePhase[] = [
  "results-0", "results-1", "results-2",
  "fees-0", "fees-1", "fees-2",
];

const DURATIONS: Record<SurfacePhase, number> = {
  "results-0": 2000,
  "results-1": 1600,
  "results-2": 1800,
  "fees-0": 1200,
  "fees-1": 1600,
  "fees-2": 2200,
};

export function HeroSurface() {
  const [phase, setPhase] = useState<SurfacePhase>("results-0");
  const reduced = usePrefersReducedMotion();

  const advance = useCallback(() => {
    setPhase((p) => PHASES[(PHASES.indexOf(p) + 1) % PHASES.length]);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(advance, DURATIONS[phase]);
    return () => clearTimeout(t);
  }, [phase, reduced, advance]);

  const isResults = reduced || phase.startsWith("results");
  const isFees = reduced || !phase.startsWith("results");

  return (
    <div className="w-full max-w-[420px] rounded-2xl bg-ink border border-white/[0.08] shadow-2xl overflow-hidden font-mono">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex gap-1.5" aria-hidden>
          <span className="w-3 h-3 rounded-full bg-clay/60" />
          <span className="w-3 h-3 rounded-full bg-amber/60" />
          <span className="w-3 h-3 rounded-full bg-grass/60" />
        </div>
        <span className="text-n-400 mx-auto text-[10px] tracking-widest select-none">
          SCHOOL_OS // v2.4
        </span>
        <span className="w-2 h-2 rounded-full bg-grass animate-pulse" aria-hidden />
      </div>

      {/* Tab strip */}
      <div className="flex border-b border-white/[0.08] select-none" role="tablist" aria-label="Active module">
        {(["RESULTS", "FEES"] as const).map((tab) => {
          const active = tab === "RESULTS" ? isResults : isFees;
          return (
            <span
              key={tab}
              role="tab"
              aria-selected={active}
              className={cn(
                "px-5 py-2.5 text-[10px] tracking-widest transition-colors cursor-default",
                active
                  ? tab === "RESULTS"
                    ? "text-grass border-b-2 border-grass bg-white/[0.03]"
                    : "text-amber border-b-2 border-amber bg-white/[0.03]"
                  : "text-n-500",
              )}
            >
              {tab}
            </span>
          );
        })}
      </div>

      {/* Panels */}
      <div className="p-4 min-h-[300px]" role="tabpanel">
        {reduced ? (
          <div className="space-y-6">
            <HeroResultsPanel phase="results-2" reduced />
            <HeroFeesPanel phase="fees-2" reduced />
          </div>
        ) : isResults ? (
          <HeroResultsPanel phase={phase} reduced={false} />
        ) : (
          <HeroFeesPanel phase={phase} reduced={false} />
        )}
      </div>
    </div>
  );
}
