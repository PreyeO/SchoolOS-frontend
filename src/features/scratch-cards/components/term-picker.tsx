"use client";

import { cn } from "@/lib/utils";

interface Props {
  periods: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

// Three or so terms read better as buttons than as a dropdown on a phone:
// one tap, and every option is visible at once. A radio group underneath.
export function TermPicker({ periods, value, onChange, error }: Props) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="mb-1.5 text-sm font-medium text-ink">Term</legend>
      <div role="radiogroup" aria-label="Term" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {periods.map((p) => {
          const selected = p.id === value;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(p.id)}
              className={cn(
                "h-11 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-n-200 bg-white text-ink hover:border-n-300",
              )}
            >
              {p.name}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </fieldset>
  );
}
