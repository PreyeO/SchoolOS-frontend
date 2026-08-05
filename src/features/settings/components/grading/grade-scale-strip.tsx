import { cn } from "@/lib/utils";
import type { GradeRange } from "../../api/grading-api";

// Colored by the WAEC "credit and above" convention rather than by grade
// letter (which varies per school — A1-F9 vs a plain A-F) — a band's own
// min_score is what actually carries pass/fail meaning: 50+ is a genuine
// credit/pass (grass), 40-49 is a weak pass (amber), below 40 is a fail (clay).
function bandColor(minScore: number): string {
  if (minScore >= 50) return "bg-grass/10 text-grass";
  if (minScore >= 40) return "bg-amber/15 text-amber";
  return "bg-clay/10 text-clay";
}

export function GradeScaleStrip({ ranges }: { ranges: GradeRange[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {ranges.map((r) => (
        <li key={r.id} className={cn("rounded-lg px-2.5 py-1.5", bandColor(r.min_score))}>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold">{r.grade}</span>
            <span className="text-xs opacity-70 tabular-nums">
              {r.min_score}–{r.max_score}
            </span>
          </div>
          {r.remark && <p className="text-xs opacity-70">{r.remark}</p>}
        </li>
      ))}
    </ul>
  );
}
