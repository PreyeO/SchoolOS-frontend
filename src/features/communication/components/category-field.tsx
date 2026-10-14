"use client";

import { ANNOUNCEMENT_CATEGORIES } from "../lib/categories";
import type { AnnouncementCategory } from "../types";

interface Props {
  value: AnnouncementCategory;
  onChange: (next: AnnouncementCategory) => void;
}

// Radios, not a dropdown: there are four, exactly one applies, and the whole
// point is that the author sees what the alternatives are — a collapsed select
// would hide "Urgent" from someone posting about a flood.
//
// Each option states what it's for rather than what it looks like. An author
// choosing by outcome ("closures, emergencies") tags more accurately than one
// choosing by decoration ("the amber one").
export function CategoryField({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="sr-only">Kind of notice</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ANNOUNCEMENT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const selected = value === category.value;
          return (
            <label
              key={category.value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition-colors ${
                selected ? "border-primary/50 bg-primary/5" : "border-n-200 hover:bg-n-50"
              }`}
            >
              <input
                type="radio"
                name="announcement-category"
                value={category.value}
                checked={selected}
                onChange={() => onChange(category.value)}
                className="mt-0.5 size-3.5 accent-primary focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                  {Icon && <Icon className="size-3.5 shrink-0 text-n-400" />}
                  {category.label}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-n-500">
                  {category.hint}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
