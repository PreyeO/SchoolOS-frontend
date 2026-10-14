import { MapPin } from "lucide-react";

import type { StateReach } from "../../lib/platform-reach";
import { OverviewCard } from "./overview-card";

// Nigeria has 37 states (with the FCT). Shown as a fraction so the reach
// number has a ceiling to read against.
const STATE_TOTAL = 37;

// Where SchoolOS is, ranked by schools. A ranked list rather than a map: at
// a handful of states a map is mostly empty, while a list says exactly where
// and how big. Bars share one scale — the leading state's student count — so
// lengths compare across rows.
export function ReachByState({ states }: { states: StateReach[] }) {
  const maxStudents = Math.max(1, ...states.map((s) => s.students));

  return (
    <OverviewCard
      title="Reach by state"
      icon={MapPin}
      aside={`${states.length} of ${STATE_TOTAL} states`}
    >
      {states.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm italic text-n-400">No schools yet.</p>
      ) : (
        <ul className="divide-y divide-n-100">
          {states.map((s) => (
            <li key={s.state} className="space-y-1.5 px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0">
                  <span className="text-sm font-medium text-ink">{s.label}</span>
                  <span className="ml-2 text-xs text-n-500 wrap-break-word">{s.cities.join(", ")}</span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-n-500">
                  {s.schools} {s.schools === 1 ? "school" : "schools"} · {s.students.toLocaleString()} students
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-n-100" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max((s.students / maxStudents) * 100, 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </OverviewCard>
  );
}
