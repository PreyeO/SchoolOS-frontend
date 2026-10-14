import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { buildAttentionList } from "../../lib/attention";
import type { SchoolFinancialRow } from "../../types";
import { AccessBadge } from "../access-badge";
import { OverviewCard } from "./overview-card";

// Schools someone should act on. No dates map: the financials payload
// carries access_status but not expiry dates, so this surfaces already-expired
// schools only. "Expiring soon" would need a detail request per school.
export function AttentionPanel({ rows }: { rows: SchoolFinancialRow[] }) {
  const attention = buildAttentionList(rows);

  return (
    <OverviewCard title="Needs attention" icon={TriangleAlert} link={{ href: "/platform/schools", label: "All schools" }}>
      {attention.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm italic text-n-400">Every school has active access.</p>
      ) : (
        <ul className="divide-y divide-n-100">
          {attention.map(({ row, reason, daysLeft }) => (
            <li key={row.school.id}>
              <Link
                href={`/platform/schools/${row.school.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-n-50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{row.school.name}</span>
                  <span className="block truncate text-xs text-n-500">
                    {row.student_count} student{row.student_count === 1 ? "" : "s"} · {row.school.city}
                  </span>
                </span>
                {reason === "expiring" && daysLeft !== null && (
                  <span className="shrink-0 text-xs text-amber">{daysLeft === 0 ? "Ends today" : `${daysLeft}d left`}</span>
                )}
                <AccessBadge status={row.access_status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </OverviewCard>
  );
}
