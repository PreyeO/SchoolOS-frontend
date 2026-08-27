"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { PersonAvatar } from "@/components/shared/person-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MeChildLink } from "@/features/me/types";

interface Props {
  child: MeChildLink;
  // Not named `children` — that's React's own slot prop, and a list of child
  // records passed under it would be rendered as content rather than read here.
  childrenLinks: MeChildLink[];
  onSelect: (studentId: string) => void;
}

function nameParts(fullName: string): [string, string] {
  const [first = fullName, ...rest] = fullName.split(" ");
  return [first, rest.join(" ")];
}

// Picks which child every parent screen is about — the same role the school
// switcher plays for an admin, and modelled on it.
//
// With one child it renders as plain text, not a disabled dropdown: a control
// that opens to reveal the only option already shown is a promise of choice
// that isn't there, and most parents have exactly one child enrolled.
export function ChildSwitcher({ child, childrenLinks, onSelect }: Props) {
  const [first, last] = nameParts(child.student_name);

  if (childrenLinks.length < 2) {
    return (
      <span className="flex items-center gap-2.5">
        <PersonAvatar firstName={first} lastName={last} className="size-8 shrink-0" />
        <span className="truncate font-display text-lg font-semibold text-ink">
          {child.student_name}
        </span>
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-lg border border-n-200 bg-white px-2.5 py-1.5 transition-colors hover:bg-n-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PersonAvatar firstName={first} lastName={last} className="size-8 shrink-0" />
          <span className="max-w-44 truncate font-display text-lg font-semibold text-ink">
            {child.student_name}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-n-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Your children</DropdownMenuLabel>
        {childrenLinks.map((option) => {
          const [optionFirst, optionLast] = nameParts(option.student_name);
          const active = option.student_id === child.student_id;

          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onSelect(option.student_id)}
              className="gap-2.5"
            >
              <PersonAvatar
                firstName={optionFirst}
                lastName={optionLast}
                className="size-7 shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink">{option.student_name}</span>
                <span className="block truncate font-mono text-[11px] text-n-400">
                  {option.admission_number}
                </span>
              </span>
              {active && <Check className="size-4 shrink-0 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
