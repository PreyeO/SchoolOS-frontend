"use client";

import { useState, type ReactNode } from "react";
import { Check, Search, UserRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/shared/error-state";
import { cn } from "@/lib/utils";

import type { TeacherListItem } from "../types";

interface Props {
  // Already narrowed by the caller — each dialog excludes a different set
  // (teachers who can't run a class, teachers already on this subject).
  teachers: TeacherListItem[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  selected: string | null;
  onSelect: (id: string) => void;
  // What to say when the list is empty for reasons other than the search —
  // the two callers have genuinely different explanations.
  emptyState: ReactNode;
  // The second line under each name. Differs by caller: one shows teacher type
  // and specialization, the other which other arms they already lead.
  renderSubLabel: (teacher: TeacherListItem) => ReactNode;
  className?: string;
}

// Search-and-pick one teacher from a list already in hand.
//
// Distinct from PersonSearchSelect, which queries the server per keystroke and
// fires on click. Here the whole (small) teacher list is fetched once and
// filtered locally, and the choice is *held* until the dialog is submitted —
// so it behaves like a radio group, not a typeahead.
export function TeacherPicker({
  teachers,
  isPending,
  isError,
  error,
  selected,
  onSelect,
  emptyState,
  renderSubLabel,
  className,
}: Props) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const matches = teachers.filter(
    (t) =>
      !query ||
      `${t.user.first_name} ${t.user.last_name}`.toLowerCase().includes(query) ||
      t.user.email.toLowerCase().includes(query),
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-n-400" />
        <Input
          placeholder="Search teachers by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
          aria-label="Search teachers"
        />
      </div>

      {isPending ? (
        <p className="py-6 text-center text-sm text-n-400" role="status">Loading teachers…</p>
      ) : isError ? (
        <div className="py-4">
          <ErrorState error={error} resourceLabel="teachers" />
        </div>
      ) : matches.length === 0 ? (
        <div className="py-6 text-center">
          {query ? (
            <p className="text-sm text-n-500">No teachers match that search.</p>
          ) : (
            emptyState
          )}
        </div>
      ) : (
        <ul
          className={cn("space-y-1 overflow-y-auto pr-0.5", className ?? "max-h-52")}
          role="radiogroup"
          aria-label="Teachers"
        >
          {matches.map((teacher) => {
            const isSelected = selected === teacher.id;
            return (
              <li key={teacher.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelect(teacher.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    isSelected
                      ? "border-primary/40 bg-primary/5"
                      : "border-n-200 hover:border-n-300",
                  )}
                >
                  <UserRound className="size-4 shrink-0 text-n-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">
                      {teacher.user.first_name} {teacher.user.last_name}
                    </span>
                    <span className="block truncate text-xs text-n-400">
                      {renderSubLabel(teacher)}
                    </span>
                  </span>
                  {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
