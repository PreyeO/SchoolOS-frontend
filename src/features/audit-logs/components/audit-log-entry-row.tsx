import { Activity } from "lucide-react";

import { formatTimeOfDay } from "@/lib/text/format-time-of-day";
import { cn } from "@/lib/utils";

import { actionMeta } from "../lib/action-catalog";
import { categoryByKey } from "../lib/audit-categories";
import { auditTone, TONE_STYLES } from "../lib/audit-tone";
import { formatAuditParts } from "../lib/format-audit-entry";
import type { AuditLogEntry } from "../types";
import { AuditLogChanges } from "./audit-log-changes";

// Deliberately no actor avatar: at 25 dense rows a photo per line competes with
// the category icon and makes the column harder to scan, not easier. The icon
// rail answers "what kind of change" at a glance; the actor's name carries the
// "who" in normal reading weight.
export function AuditLogEntryRow({ entry }: { entry: AuditLogEntry }) {
  const { actor, rest } = formatAuditParts(entry);
  const category = categoryByKey(actionMeta(entry.action).category);
  const Icon = category?.icon ?? Activity;
  const tone = auditTone(entry.action);

  return (
    <li className="flex gap-3 px-4 py-3">
      <span
        className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", TONE_STYLES[tone])}
        title={category?.label}
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-snug text-ink">
            <span className="font-medium">{actor}</span> <span className="text-n-600">{rest}</span>
          </p>
          <time
            dateTime={entry.created_at}
            title={new Date(entry.created_at).toLocaleString("en-US")}
            className="shrink-0 text-xs tabular-nums text-n-400"
          >
            {formatTimeOfDay(entry.created_at)}
          </time>
        </div>

        {entry.changes && entry.changes.length > 0 && <AuditLogChanges changes={entry.changes} />}
      </div>
    </li>
  );
}
