"use client";

import type { StudentLedger } from "@/features/fees/types";
import type { ReportCard } from "@/features/results/types";
import { formatNaira } from "@/lib/text/format-naira";
import { ordinal } from "@/lib/text/ordinal";

interface Props {
  ledger: StudentLedger | undefined;
  reportCard: ReportCard | undefined;
  awaitingResults: boolean;
}

// The four numbers worth reading before opening either tab.
//
// Every one of them can legitimately be absent — results aren't published, the
// child isn't billed this term, positions don't exist until the broadsheet
// locks — so each tile states which of those it is instead of showing a zero.
// A zero here would be read as a fact ("no fees owed", "scored 0"), and both
// would be wrong.
export function RecordSnapshot({ ledger, reportCard, awaitingResults }: Props) {
  const summary = reportCard?.summary;
  const subjectCount = reportCard?.subjects.length ?? 0;
  const owing = ledger?.is_billed ? ledger.total_balance : null;

  const tiles = [
    {
      label: "Term average",
      value: summary ? `${Number(summary.average_score)}%` : null,
      hint: awaitingResults ? "Not published yet" : "No results yet",
      tone: "neutral" as const,
    },
    {
      label: "Position",
      value: summary?.position_in_arm ? ordinal(summary.position_in_arm) : null,
      hint: summary ? "Not ranked" : awaitingResults ? "Not published yet" : "—",
      tone: "neutral" as const,
    },
    {
      label: "Subjects",
      value: subjectCount > 0 ? String(subjectCount) : null,
      hint: awaitingResults ? "Not published yet" : "None recorded",
      tone: "neutral" as const,
    },
    {
      label: "Outstanding",
      value: owing === null ? null : formatNaira(owing),
      hint: ledger?.is_billed ? "Fully paid" : "Not billed this term",
      tone: owing === 0 ? ("good" as const) : ("neutral" as const),
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl border border-n-200 bg-white p-3.5">
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">
            {tile.label}
          </dt>
          <dd
            className={`mt-1 truncate font-display text-xl font-bold tabular-nums ${
              tile.value === null ? "text-n-300" : tile.tone === "good" ? "text-grass" : "text-ink"
            }`}
          >
            {tile.value ?? "—"}
          </dd>
          {/* The hint explains an absent value, and confirms a settled balance.
              A present figure needs no caption. */}
          {(tile.value === null || tile.tone === "good") && (
            <dd className="mt-0.5 truncate text-[11px] text-n-500">{tile.hint}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}
