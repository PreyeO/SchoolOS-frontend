"use client";

import { Input } from "@/components/ui/input";
import { toLocalIsoDate } from "@/lib/text/format-date";

interface Props {
  idPrefix: string;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

// From/To date pickers for list filters that take created_at_after/_before
// (date-only, inclusive). Same layout as the audit log's: two label/date
// pairs are wider than a 360px phone, so below sm they stack as a grid.
// Each bound caps the other, so an inverted range can't be picked.
export function DateRangeFields({ idPrefix, from, to, onFromChange, onToChange }: Props) {
  const today = toLocalIsoDate();
  return (
    <div className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-1.5 sm:flex sm:w-auto">
      <label htmlFor={`${idPrefix}-from`} className="text-sm text-n-500">From</label>
      <Input
        id={`${idPrefix}-from`}
        type="date"
        value={from}
        max={to || today}
        onChange={(e) => onFromChange(e.target.value)}
        className="h-9 w-full sm:w-auto"
      />
      <label htmlFor={`${idPrefix}-to`} className="text-sm text-n-500">To</label>
      <Input
        id={`${idPrefix}-to`}
        type="date"
        value={to}
        min={from || undefined}
        max={today}
        onChange={(e) => onToChange(e.target.value)}
        className="h-9 w-full sm:w-auto"
      />
    </div>
  );
}

// The query params for a range, omitting empty bounds.
export function dateRangeParams(from: string, to: string): { created_at_after?: string; created_at_before?: string } {
  return { ...(from && { created_at_after: from }), ...(to && { created_at_before: to }) };
}
