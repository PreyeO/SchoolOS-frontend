import { groupByDay } from "@/lib/text/group-by-day";

import type { AuditLogEntry } from "../types";
import { AuditLogEntryRow } from "./audit-log-entry-row";

export function AuditLogTimeline({ entries }: { entries: AuditLogEntry[] }) {
  const groups = groupByDay(entries);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">{group.label}</h2>
          <ul className="divide-y divide-n-100 overflow-hidden rounded-xl border border-n-200 bg-white">
            {group.items.map((entry) => (
              <AuditLogEntryRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
