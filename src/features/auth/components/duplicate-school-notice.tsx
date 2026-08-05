import { Info } from "lucide-react";

import { NIGERIAN_STATES } from "@/data/nigerian-states";
import type { SchoolSearchResult } from "../types";

// Enough to be recognisable without turning the form into a search results page
// — the backend matches on a substring, so a word like "College" can return a lot.
const MAX_SHOWN = 3;

function stateLabel(value: string): string {
  return NIGERIAN_STATES.find((s) => s.value === value)?.label ?? value;
}

// Advisory only, and worded that way on purpose: school names carry no
// uniqueness constraint (just the slug), and plenty of Nigerian schools share a
// name across states. The real problem this prevents is an owner creating a
// second tenant for a school that's already on SchoolOS, when what they
// actually need is an invite to the existing one.
export function DuplicateSchoolNotice({ matches }: { matches: SchoolSearchResult[] }) {
  if (matches.length === 0) return null;

  const shown = matches.slice(0, MAX_SHOWN);
  const extra = matches.length - shown.length;

  return (
    <div
      role="status"
      className="flex items-start gap-2.5 rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-3"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-amber" />
      <div>
        <p className="text-sm font-medium text-ink">
          {matches.length === 1
            ? "A school with a similar name is already on SchoolOS"
            : "Schools with similar names are already on SchoolOS"}
        </p>
        <ul className="mt-1.5 space-y-0.5 text-sm text-n-600">
          {shown.map((s) => (
            <li key={s.id}>
              {s.name} <span className="text-n-400">— {s.city}, {stateLabel(s.state)}</span>
            </li>
          ))}
        </ul>
        {extra > 0 && (
          <p className="mt-0.5 text-xs text-n-500">and {extra} more</p>
        )}
        <p className="mt-2 text-xs text-n-500">
          If one of these is your school, ask an admin there to invite you rather than setting it
          up again. If it&rsquo;s a different school, carry on — names don&rsquo;t need to be unique.
        </p>
      </div>
    </div>
  );
}
