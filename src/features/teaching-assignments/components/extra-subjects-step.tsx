"use client";

import { cn } from "@/lib/utils";
import type { SubjectResponse } from "@/features/onboarding/types";

interface Props {
  teacherFirstName: string;
  armLabel: string;
  // Every subject the arm takes except the one the dialog was opened from —
  // that one is always in the batch and deliberately can't be unticked.
  otherSubjects: SubjectResponse[];
  // What this teacher already teaches to this arm.
  heldByTeacher: Set<string>;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}

// The bulk step: give this teacher more of the arm's subjects in one go.
//
// Held back until a teacher is chosen, because "which other subjects" is
// unanswerable before then and a second list would only crowd the first.
export function ExtraSubjectsStep({
  teacherFirstName,
  armLabel,
  otherSubjects,
  heldByTeacher,
  selected,
  onToggle,
  onToggleAll,
}: Props) {
  const assignable = otherSubjects.filter((s) => !heldByTeacher.has(s.id));
  const allSelected = assignable.length > 0 && assignable.every((s) => selected.has(s.id));

  return (
    <div className="space-y-2 border-t border-n-100 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink">
          Give {teacherFirstName} other subjects in {armLabel}?
        </p>
        {assignable.length > 0 && (
          <button
            type="button"
            onClick={onToggleAll}
            className="cursor-pointer text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {allSelected ? "Clear" : `Select all ${assignable.length}`}
          </button>
        )}
      </div>

      {/* Capped and scrollable: a senior arm can offer 20+ subjects, and
          unbounded chips pushed the Assign button out of reach. content-start
          because a wrapped flex row in a height-capped box otherwise stretches
          its lines to fill, spacing the chips out. */}
      <div className="flex max-h-28 flex-wrap content-start gap-1.5 overflow-y-auto pr-0.5">
        {otherSubjects.map((s) => {
          const held = heldByTeacher.has(s.id);
          const on = selected.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              disabled={held}
              onClick={() => onToggle(s.id)}
              aria-pressed={held || on}
              title={held ? `Already teaches ${s.name} to ${armLabel}` : undefined}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                held
                  ? "cursor-default border-n-200 bg-n-50 text-n-400"
                  : on
                    ? "cursor-pointer border-primary/40 bg-primary/10 text-primary"
                    : "cursor-pointer border-n-200 text-n-600 hover:border-n-300",
              )}
            >
              {s.name}
              {held && " ✓"}
            </button>
          );
        })}
      </div>

      {assignable.length === 0 && (
        <p className="text-xs text-n-400">
          {teacherFirstName} already teaches every other subject this arm takes.
        </p>
      )}
    </div>
  );
}
