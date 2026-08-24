"use client";

import Link from "next/link";

import { formatNaira } from "@/lib/text/format-naira";

import type { FeeDefaulter } from "../types";

interface Props {
  defaulters: FeeDefaulter[];
  // Carried into the link so the ledger a bursar lands on shows the same
  // balance they just saw here — the arrears list can be viewing a past term,
  // and defaulting the destination back to "current" would land on a different
  // (and inconsistent) figure than the one that prompted the click.
  periodId: string | null;
}

// Who in this arm still owes, worst first is NOT the order — the backend sorts
// by admission number, and re-sorting client-side would break the register-style
// reading a class teacher does down the list. The total at the foot is what
// answers "how much is this class carrying".
export function ArrearsTable({ defaulters, periodId }: Props) {
  const owed = defaulters.reduce((sum, d) => sum + d.total_balance, 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2.5 font-medium">Student</th>
            <th className="px-3 py-2.5 font-medium">Admission no.</th>
            <th className="px-3 py-2.5 font-medium text-right">Billed</th>
            <th className="px-3 py-2.5 font-medium text-right">Paid</th>
            <th className="px-3 py-2.5 font-medium text-right">Owing</th>
          </tr>
        </thead>
        <tbody>
          {defaulters.map((row) => (
            <tr key={row.student.id} className="border-b border-n-100 last:border-0">
              <td className="px-3 py-2.5 text-sm">
                {/* Drills into the same student's fee breakdown on /fees. Only
                    a link when the arm has a resolved period — the guard is
                    defensive; ArrearsTab never renders this table without one. */}
                {periodId ? (
                  <Link
                    href={`/fees?student=${row.student.id}&period=${periodId}`}
                    className="text-ink hover:underline"
                  >
                    {row.student.user.first_name} {row.student.user.last_name}
                  </Link>
                ) : (
                  <span className="text-ink">
                    {row.student.user.first_name} {row.student.user.last_name}
                  </span>
                )}
              </td>
              <td className="px-3 py-2.5 font-mono text-xs text-n-500">
                {row.student.admission_number}
              </td>
              <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums text-n-500">
                {formatNaira(row.total_billed)}
              </td>
              <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums text-n-500">
                {row.total_paid > 0 ? formatNaira(row.total_paid) : "—"}
              </td>
              <td className="px-3 py-2.5 text-right font-mono text-sm font-medium tabular-nums text-ink">
                {formatNaira(row.total_balance)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-n-200 bg-n-50">
            <td className="px-3 py-2.5 text-sm font-medium text-ink" colSpan={4}>
              {defaulters.length === 1 ? "1 student owing" : `${defaulters.length} students owing`}
            </td>
            <td className="px-3 py-2.5 text-right font-mono text-sm font-semibold tabular-nums text-ink">
              {formatNaira(owed)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
