"use client";

import { Check } from "lucide-react";

import type { GradeComponent } from "@/features/settings/api/grading-api";
import { cn } from "@/lib/utils";

interface Props {
  components: GradeComponent[];
  value: string | null;
  onChange: (componentId: string) => void;
  // How many of the class already have a score, per component id.
  enteredByComponent: Map<string, number>;
  total: number;
}

// Each tab carries its own progress, which is the point of it. "Which column
// still needs work" is the question a teacher opens this screen with, and a bare
// row of names ("1st CA · 2nd CA · Exam") answers it only after you click each
// one. The count is also what makes the mark scheme legible — /20 versus /60
// tells you what kind of assessment it is.
export function ComponentTabs({ components, value, onChange, enteredByComponent, total }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Assessment component"
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {components.map((component) => {
        const entered = enteredByComponent.get(component.id) ?? 0;
        const complete = total > 0 && entered === total;
        const active = value === component.id;

        return (
          <button
            key={component.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(component.id)}
            className={cn(
              "min-w-32 shrink-0 cursor-pointer rounded-xl border px-3.5 py-2.5 text-left transition-colors",
              active
                ? "border-primary bg-primary/5"
                : "border-n-200 bg-white hover:border-n-300",
            )}
          >
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium text-ink">{component.name}</span>
              {complete && <Check className="size-3.5 shrink-0 text-grass" />}
            </span>
            <span className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-mono text-[11px] text-n-400">
                out of {component.max_obtainable}
              </span>
              <span
                className={cn(
                  "ml-auto text-[11px] tabular-nums",
                  complete ? "text-grass" : "text-n-500",
                )}
              >
                {entered}/{total}
              </span>
            </span>
            {/* A thin fill rather than a number alone: across three or four
                components the eye compares bar lengths far faster than it reads
                fractions. */}
            <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-n-100">
              <span
                className={cn(
                  "block h-full rounded-full transition-[width] duration-300",
                  complete ? "bg-grass" : "bg-primary",
                )}
                style={{ width: total > 0 ? `${(entered / total) * 100}%` : "0%" }}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
