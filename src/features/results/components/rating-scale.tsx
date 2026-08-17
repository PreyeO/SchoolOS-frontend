"use client";

import { cn } from "@/lib/utils";

interface Props {
  value: number | undefined;
  onChange: (rating: number) => void;
  readOnly?: boolean;
  label: string;
}

// 1-5, as five buttons rather than a select or a star row.
//
// Stars imply a review; these are conduct ratings a teacher must be able to
// place deliberately and re-read later. Numbers are also what the report card
// prints, so showing anything else here would mean translating in your head.
// Five targets is a single tap on a phone, where a select is two.
const SCALE = [1, 2, 3, 4, 5];

export function RatingScale({ value, onChange, readOnly, label }: Props) {
  return (
    <span role="radiogroup" aria-label={label} className="flex shrink-0 gap-1">
      {SCALE.map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${n} out of 5`}
            disabled={readOnly}
            onClick={() => onChange(n)}
            className={cn(
              "size-8 rounded-lg border text-xs font-medium tabular-nums transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              readOnly
                ? "cursor-not-allowed border-n-200 bg-n-50 text-n-300"
                : active
                  ? "cursor-pointer border-primary bg-primary text-primary-foreground"
                  : "cursor-pointer border-n-200 text-n-500 hover:border-n-300",
            )}
          >
            {n}
          </button>
        );
      })}
    </span>
  );
}
