"use client";

import { ANNOUNCEMENT_AUDIENCES } from "../lib/audiences";
import type { AnnouncementAudience } from "../types";

interface Props {
  value: AnnouncementAudience[];
  onChange: (next: AnnouncementAudience[]) => void;
  hasError?: boolean;
}

// Who the notice goes to. Checkboxes rather than a multi-select listbox: there
// are exactly four options, they're all visible at once, and a school admin
// picking "Parents and Students" shouldn't have to discover ctrl-click.
//
// Toggling preserves the canonical order rather than appending in click order,
// so an edit that unticks and re-ticks the same audience doesn't register as a
// change in the audit log's before/after diff.
export function AudienceField({ value, onChange, hasError }: Props) {
  function toggle(persona: AnnouncementAudience) {
    const next = value.includes(persona)
      ? value.filter((p) => p !== persona)
      : ANNOUNCEMENT_AUDIENCES.filter((a) => a.value === persona || value.includes(a.value)).map(
          (a) => a.value,
        );
    onChange(next);
  }

  return (
    <fieldset>
      <legend className="sr-only">Audience</legend>
      <div
        className={`flex flex-wrap gap-2 rounded-lg border p-2 ${
          hasError ? "border-destructive" : "border-input"
        }`}
      >
        {ANNOUNCEMENT_AUDIENCES.map((audience) => {
          const checked = value.includes(audience.value);
          return (
            <label
              key={audience.value}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${
                checked
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-n-200 text-n-600 hover:bg-n-50"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(audience.value)}
                className="size-3.5 rounded border-n-300 text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              {audience.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
