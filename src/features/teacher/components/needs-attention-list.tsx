import { TriangleAlert } from "lucide-react";

import type { AbsenceEntry } from "../lib/attendance-derivations";

// The handful of students with the most absences across this teacher's classes.
//
// Absences only — "late" counts as present, so a diligently-marked lateness
// never lands anyone here. Capped upstream at five: it's a prompt to have a
// conversation, not a report.
export function NeedsAttentionList({ entries }: { entries: AbsenceEntry[] }) {
  return (
    <section className="rounded-xl border border-n-200 bg-white p-5">
      <h2 className="font-display text-base font-semibold text-ink">Needs attention</h2>
      <p className="mt-0.5 text-xs text-n-400">Most absences recorded in your classes</p>
      <ul className="mt-3 divide-y divide-n-100">
        {entries.map((entry) => (
          <li key={entry.studentId} className="flex items-center gap-3 py-2.5">
            <TriangleAlert className="size-4 shrink-0 text-amber" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-ink">{entry.name}</span>
              <span className="block truncate font-mono text-[11px] text-n-400">
                {entry.admissionNumber}
                {entry.className && ` · ${entry.className}`}
              </span>
            </span>
            <span className="shrink-0 text-sm text-n-600">
              {entry.absences} {entry.absences === 1 ? "absence" : "absences"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
