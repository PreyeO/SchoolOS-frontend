"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SKIP_BUCKETS } from "../../lib/issuance-verdict";
import type { IssuanceChannel, IssuancePreview, PreviewRow } from "../../types";

interface Props {
  preview: IssuancePreview;
  channel: IssuanceChannel;
  onAddNumber: (row: PreviewRow) => void;
}

function RowLine({ row, channel, action }: { row: PreviewRow; channel: IssuanceChannel; action?: React.ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink wrap-break-word">
          {row.student_name} <span className="font-mono text-xs text-n-400">{row.admission_number}</span>
        </p>
        {channel === "sms" && row.phone_masked && (
          <p className="text-xs text-n-500">
            {row.guardian_name || "Parent"} · <span className="font-mono">{row.phone_masked}</span>
            {row.pages > 1 ? ` · ${row.pages} credits` : ""}
          </p>
        )}
      </div>
      {action}
    </li>
  );
}

// Who gets a card, then each reason someone won't, as collapsible lists.
// Students without a usable number get an inline "Add number" (the parent's
// number then needs a fresh check: the preview is a snapshot).
export function PreviewBuckets({ preview, channel, onAddNumber }: Props) {
  const skips = SKIP_BUCKETS.filter((b) => preview[b.key].length > 0);

  return (
    <div className="space-y-2">
      {preview.eligible.length > 0 && (
        <details className="rounded-xl border border-n-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink">
            {preview.eligible.length} will get a card
          </summary>
          <ul className="max-h-72 divide-y divide-n-100 overflow-y-auto border-t border-n-100">
            {preview.eligible.map((row) => <RowLine key={row.student_id} row={row} channel={channel} />)}
          </ul>
        </details>
      )}

      {skips.map((bucket) => (
        <details key={bucket.key} open={bucket.key === "no_number" || bucket.key === "invalid_number"} className="rounded-xl border border-amber/40 bg-amber/5">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink">
            {preview[bucket.key].length} skipped: {bucket.label}
            <span className="block text-xs font-normal text-n-500">{bucket.hint}</span>
          </summary>
          <ul className="max-h-72 divide-y divide-amber/20 overflow-y-auto border-t border-amber/20 bg-white">
            {bucket.key === "not_found"
              ? preview.not_found.map((r) => (
                  <li key={r.student_id} className="px-3 py-2 font-mono text-xs text-n-500">{r.student_id}</li>
                ))
              : preview[bucket.key].map((row) => (
                  <RowLine
                    key={row.student_id}
                    row={row}
                    channel={channel}
                    action={
                      bucket.key === "no_number" || bucket.key === "invalid_number" ? (
                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => onAddNumber(row)}>
                          <Plus className="size-3.5" /> Add number
                        </Button>
                      ) : undefined
                    }
                  />
                ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
