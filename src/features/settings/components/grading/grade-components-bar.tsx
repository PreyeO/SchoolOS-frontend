import { cn } from "@/lib/utils";
import type { GradeComponent } from "../../api/grading-api";

// A fixed, cycling palette rather than one color per possible component —
// schools rarely define more than 4-5 components, and cycling keeps colors
// legible without needing to compute one per arbitrary count. The first two
// lean on the school's own brand colors (primary/accent) so the bar picks up
// each school's theme like the rest of the dashboard shell does.
const SEGMENT_COLORS = ["bg-primary", "bg-accent", "bg-n-400", "bg-n-300", "bg-n-200"];

export function GradeComponentsBar({ components }: { components: GradeComponent[] }) {
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-n-100">
        {components.map((c, i) => (
          <div
            key={c.id}
            style={{ width: `${c.max_obtainable}%` }}
            className={cn("h-full", SEGMENT_COLORS[i % SEGMENT_COLORS.length])}
            title={`${c.name}: ${c.max_obtainable}`}
          />
        ))}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
        {components.map((c, i) => (
          <li key={c.id} className="flex items-center gap-1.5 text-sm">
            <span className={cn("size-2 shrink-0 rounded-full", SEGMENT_COLORS[i % SEGMENT_COLORS.length])} />
            <span className="text-ink">{c.name}</span>
            <span className="text-n-400">{c.max_obtainable}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
