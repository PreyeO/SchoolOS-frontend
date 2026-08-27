import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { PersonAvatar } from "@/components/shared/person-avatar";
import { armDisplayName } from "@/lib/school/arm-display-name";
import { formatNaira } from "@/lib/text/format-naira";
import { ordinal } from "@/lib/text/ordinal";

import type { ChildOverview } from "../hooks/use-children-overview";

// One child, with the two things a parent opens the app to check: how the term
// is going, and whether anything is owed.
//
// Everything past the name comes from the ledger and report card rather than
// /me — student_links carry only a name and admission number, which is what
// made the first version of this card read as an empty placeholder.
export function ChildCard({ overview }: { overview: ChildOverview }) {
  const { link, ledger, reportCard, awaitingResults, isPending } = overview;
  const student = ledger?.student;
  const klass = student?.current_class;
  const summary = reportCard?.summary;

  return (
    <li>
      <Link
        href={`/my-children/${link.student_id}`}
        className="flex h-full flex-col gap-3.5 rounded-xl border border-n-200 bg-white p-4 transition-colors hover:border-n-300"
      >
        <div className="flex items-start gap-3">
          <PersonAvatar
            firstName={student?.user.first_name ?? link.student_name}
            lastName={student?.user.last_name ?? ""}
            photo={student?.user.photo}
            className="size-11 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-semibold text-ink">
              {link.student_name}
            </p>
            <p className="truncate text-xs text-n-500">
              {klass
                ? armDisplayName(
                    { name: klass.arm_name, is_default: klass.is_default },
                    klass.class_name,
                  )
                : link.relationship}
              <span className="text-n-400"> · {link.admission_number}</span>
            </p>
          </div>
          <ChevronRight className="mt-1 size-4 shrink-0 text-n-400" />
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-n-100 pt-3">
          <Stat
            label="Term average"
            value={summary ? `${Number(summary.average_score)}%` : null}
            hint={
              summary?.position_in_arm
                ? `${ordinal(summary.position_in_arm)} in class`
                : isPending
                  ? "Loading…"
                  : awaitingResults
                    ? "Not published"
                    : "No results yet"
            }
          />
          <Stat
            label="Fees"
            value={
              ledger?.is_billed
                ? ledger.total_balance === 0
                  ? "Paid"
                  : formatNaira(ledger.total_balance)
                : null
            }
            hint={
              ledger?.is_billed
                ? ledger.total_balance === 0
                  ? "Fully settled"
                  : "Outstanding"
                : isPending
                  ? "Loading…"
                  : "Not billed"
            }
            // Only money owed gets colour. A settled balance in green competes
            // with the one card that actually needs acting on.
            tone={
              ledger?.is_billed && ledger.total_balance > 0
                ? "owing"
                : ledger?.is_billed
                  ? "settled"
                  : "muted"
            }
          />
        </dl>
      </Link>
    </li>
  );
}

function Stat({
  label,
  value,
  hint,
  tone = "muted",
}: {
  label: string;
  value: string | null;
  hint: string;
  tone?: "owing" | "settled" | "muted";
}) {
  const valueTone =
    tone === "owing" ? "text-ink" : tone === "settled" ? "text-grass" : "text-ink";

  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">{label}</dt>
      <dd
        className={`mt-0.5 truncate font-display text-lg font-bold tabular-nums ${
          value ? valueTone : "text-n-300"
        }`}
      >
        {value ?? "—"}
      </dd>
      <dd className="truncate text-[11px] text-n-500">{hint}</dd>
    </div>
  );
}
