import { ArrowRight } from "lucide-react";

import { formatChange } from "../lib/format-change";
import type { AuditLogChange } from "../types";

// The before/after detail is what separates an audit log from an activity feed
// — "who updated the school profile" is far less useful than "who changed the
// primary colour from X to Y". Only update actions carry it; creates and
// deletes leave `changes` null.
export function AuditLogChanges({ changes }: { changes: AuditLogChange[] }) {
  return (
    <ul className="mt-1.5 space-y-1">
      {changes.map((change) => {
        const { label, from, to, delta } = formatChange(change);
        return (
          <li key={change.field} className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-n-400">{label}</span>
            <span className="text-n-500 line-through decoration-n-300">{from}</span>
            <ArrowRight className="size-3 shrink-0 text-n-300" aria-label="changed to" />
            <span className="font-medium text-ink">{to}</span>
            {delta && <span className="text-n-400">({delta})</span>}
          </li>
        );
      })}
    </ul>
  );
}
