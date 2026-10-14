import Link from "next/link";
import { Building2 } from "lucide-react";

import { NIGERIAN_STATES } from "@/data/nigerian-states";

import type { SchoolFinancialRow } from "../../types";
import { AccessBadge } from "../access-badge";
import { OverviewCard } from "./overview-card";

const SHOWN = 6;
const STATE_LABEL = new Map<string, string>(NIGERIAN_STATES.map((s) => [s.value, s.label]));

// Each school's size against what it's licensed for, biggest first. The bar
// is seats used out of capacity, so a school nearly full (an upsell) or
// nearly empty (an adoption problem) stands out without reading numbers.
export function SchoolsSnapshot({ rows }: { rows: SchoolFinancialRow[] }) {
  const sorted = [...rows].sort((a, b) => b.student_count - a.student_count).slice(0, SHOWN);

  return (
    <OverviewCard
      title="Schools"
      icon={Building2}
      link={rows.length > SHOWN ? { href: "/platform/schools", label: `All ${rows.length}` } : { href: "/platform/schools", label: "Manage" }}
    >
      {sorted.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm italic text-n-400">No schools yet.</p>
      ) : (
        <ul className="divide-y divide-n-100">
          {sorted.map((row) => {
            const ratio = row.student_capacity > 0 ? Math.min(row.student_count / row.student_capacity, 1) : 0;
            return (
              <li key={row.school.id}>
                <Link
                  href={`/platform/schools/${row.school.id}`}
                  className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-n-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{row.school.name}</span>
                      <span className="block truncate text-xs text-n-500">
                        {row.school.city}, {STATE_LABEL.get(row.school.state) ?? row.school.state}
                      </span>
                    </span>
                    <AccessBadge status={row.access_status} />
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="h-1.5 flex-1 rounded-full bg-n-100" aria-hidden="true">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${ratio * 100}%` }} />
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-n-500">
                      {row.student_count.toLocaleString()} / {row.student_capacity.toLocaleString()} students
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </OverviewCard>
  );
}
