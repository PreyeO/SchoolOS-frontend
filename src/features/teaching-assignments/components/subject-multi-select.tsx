"use client";

import { Check, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SubjectResponse } from "@/features/onboarding/types";

interface Props {
  subjects: SubjectResponse[];
  search: string;
  onSearchChange: (value: string) => void;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}

// Search-and-tick a set of subjects.
//
// The select-all acts on the *current search*, not the whole list, and its
// label says so — "Select all 6 matching" rather than "Select all". Adding
// twenty subjects because a filter was active is the kind of mistake that's
// tedious to undo one offering at a time.
export function SubjectMultiSelect({
  subjects,
  search,
  onSearchChange,
  selected,
  onToggle,
  onToggleAll,
}: Props) {
  const query = search.trim().toLowerCase();
  const matches = subjects.filter((s) => !query || s.name.toLowerCase().includes(query));
  const allMatchesSelected = matches.length > 0 && matches.every((s) => selected.has(s.id));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-n-400" />
        <Input
          placeholder="Search subjects"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
          aria-label="Search subjects"
        />
      </div>

      {matches.length === 0 ? (
        <p className="py-6 text-center text-sm text-n-500">
          {query
            ? "No subjects match that search."
            : "Every subject at this level is already added."}
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs text-n-400">
              {selected.size > 0
                ? `${selected.size} selected`
                : `${matches.length} available${query ? " in this search" : ""}`}
            </span>
            <button
              type="button"
              onClick={onToggleAll}
              className="cursor-pointer text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {allMatchesSelected
                ? query
                  ? "Clear these"
                  : "Clear all"
                : query
                  ? `Select all ${matches.length} matching`
                  : `Select all ${matches.length}`}
            </button>
          </div>

          <ul className="max-h-64 space-y-1 overflow-y-auto pr-0.5">
            {matches.map((subject) => {
              const isSelected = selected.has(subject.id);
              return (
                <li key={subject.id}>
                  <button
                    type="button"
                    onClick={() => onToggle(subject.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-n-200 hover:border-n-300",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{subject.name}</span>
                    {subject.is_core && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        Core
                      </span>
                    )}
                    {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
