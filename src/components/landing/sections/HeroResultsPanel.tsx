import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import type { SurfacePhase } from "./HeroSurface";

const ROWS = [
  { name: "Adaeze Okonkwo", ca: 28, ex: 64, gr: "A" },
  { name: "Emeka Eze", ca: 24, ex: 58, gr: "B" },
  { name: "Fatima Abdullahi", ca: 30, ex: 67, gr: "A" },
  { name: "Chukwudi Nwosu", ca: 22, ex: 51, gr: "C" },
  { name: "Blessing Okafor", ca: 26, ex: 60, gr: "B" },
];

interface Props {
  phase: SurfacePhase;
  reduced: boolean;
}

export function HeroResultsPanel({ phase, reduced }: Props) {
  const fillCount = reduced || phase !== "results-0" ? 5 : 3;
  const showApprove = phase === "results-1";
  const showReleased = phase === "results-2" || reduced;

  return (
    <div>
      <p className="text-[10px] text-n-400 tracking-wider mb-3 font-mono">
        TERM RESULTS · SS2A · 2024/25 THIRD TERM
      </p>

      <div className="border border-white/10 rounded-lg overflow-hidden mb-3">
        <div className="grid grid-cols-[1fr_24px_24px_28px_20px] gap-x-2 px-3 py-2 bg-white/[0.04] text-[9px] text-n-500 uppercase tracking-widest font-mono">
          <span>Student</span>
          <span className="text-right">CA</span>
          <span className="text-right">Ex</span>
          <span className="text-right">Tot</span>
          <span className="text-right">Gr</span>
        </div>
        {ROWS.map((r, i) => (
          <div
            key={r.name}
            className={cn(
              "grid grid-cols-[1fr_24px_24px_28px_20px] gap-x-2 px-3 py-2 border-t border-white/[0.06] transition-all duration-500",
              i < fillCount ? "opacity-100" : "opacity-20",
            )}
            style={{ transitionDelay: reduced ? "0ms" : `${i * 100}ms` }}
          >
            <span className="text-paper/80 truncate text-[10px] font-mono">{r.name}</span>
            <span className="text-n-400 text-right text-[10px] font-mono">{i < fillCount ? r.ca : "-"}</span>
            <span className="text-n-400 text-right text-[10px] font-mono">{i < fillCount ? r.ex : "-"}</span>
            <span className="text-paper/80 text-right text-[10px] font-mono font-semibold">{i < fillCount ? r.ca + r.ex : "-"}</span>
            <span className={cn("text-right text-[10px] font-mono font-bold", r.gr === "A" ? "text-grass" : r.gr === "B" ? "text-amber" : "text-n-400")}>
              {i < fillCount ? r.gr : "-"}
            </span>
          </div>
        ))}
      </div>

      {showApprove && (
        <button className="w-full py-2.5 rounded-lg bg-grass/20 border border-grass/40 text-grass text-[10px] tracking-widest uppercase font-bold font-mono animate-pulse cursor-default">
          APPROVE &amp; RELEASE →
        </button>
      )}

      {showReleased && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-grass/10 border border-grass/30">
          <Check className="w-3.5 h-3.5 text-grass shrink-0" />
          <span className="text-grass text-[10px] tracking-wide font-mono">42 report cards released · parents notified</span>
        </div>
      )}
    </div>
  );
}
