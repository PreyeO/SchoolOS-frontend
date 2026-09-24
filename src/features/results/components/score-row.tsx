"use client";

import type { StudentListItem } from "@/features/students/types";
import { cn } from "@/lib/utils";

import { scoreError } from "../hooks/use-score-draft";

interface Props {
  student: StudentListItem;
  value: string;
  max: number;
  // Sum across every component of this subject, moving as they type.
  total: number | undefined;
  readOnly: boolean;
  onChange: (value: string) => void;
  // Enter advances to the next student, so a full column can be entered from
  // the keyboard without reaching for the mouse.
  onEnter: () => void;
  index: number;
}

export function ScoreRow({
  student,
  value,
  max,
  total,
  readOnly,
  onChange,
  onEnter,
  index,
}: Props) {
  const error = scoreError(value, max);
  const name = `${student.user.first_name} ${student.user.last_name}`;

  return (
    // flex-wrap so a validation message can drop to its own line on a phone
    // instead of sitting in an 80px column beside the field (see the error
    // below). Nothing wraps otherwise — name, total and field fit one line.
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
      {/* Wraps on a phone, truncates from sm up. */}
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-ink sm:truncate">{name}</span>
        <span className="block font-mono text-[11px] text-n-400 sm:truncate">
          {student.admission_number}
        </span>
      </span>

      {/* Read-only running total, muted so it never competes with the field
          being filled. It's context, not an input — but seeing it move is what
          tells a teacher the mark scheme is behaving as they expect. */}
      <span className="hidden w-16 shrink-0 text-right text-xs text-n-400 tabular-nums sm:block">
        {total === undefined ? "—" : `${Number(total.toFixed(2))} total`}
      </span>

      <span className="flex shrink-0 items-center gap-1.5">
        <input
          // Not type="number": its spinners invite mis-clicks, and on iOS the
          // wheel can silently change a score while scrolling the list.
          // inputMode brings up the numeric keypad without either problem.
          type="text"
          inputMode="decimal"
          data-score-input={index}
          value={value}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter();
            }
          }}
          onFocus={(e) => e.currentTarget.select()}
          aria-label={`Score for ${name}, out of ${max}`}
          aria-invalid={!!error}
          className={cn(
            // text-base, not text-sm: this bypasses the shared Input component
            // (a bespoke compact cell), so it also has to carry the iOS-zoom
            // fix by hand — a focused control under 16px makes Safari zoom the
            // whole page, and this is the field a teacher taps 30+ times in a
            // row entering a class's scores.
            "h-9 w-16 rounded-lg border bg-background px-2 text-right text-base tabular-nums text-ink md:text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:bg-n-50 disabled:text-n-400",
            error ? "border-clay" : "border-input",
          )}
        />
        <span className="w-8 font-mono text-[11px] text-n-400">/{max}</span>
      </span>

      {/* Its own full-width line under the field on a phone, right-aligned to sit
          beneath it. In the 80px column it took beside the field, the message
          wrapped over several lines and pushed the name down to almost nothing
          — the moment a teacher most needs to read both. */}
      {error && (
        <span role="alert" className="w-full text-right text-[11px] text-clay sm:w-20 sm:shrink-0 sm:text-left">
          {error}
        </span>
      )}
    </li>
  );
}
