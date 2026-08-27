"use client";

import { formatNaira } from "@/lib/text/format-naira";

import type { StudentLedger } from "../types";
import { LedgerRow } from "./ledger-row";

interface Props {
  ledger: StudentLedger;
  studentName: string;
  // fee_item id → waiver id, for the rows that carry one.
  waiverIds: Map<string, string>;
  canRecord: boolean;
  canWaive: boolean;
}

export function LedgerTable({ ledger, studentName, waiverIds, canRecord, canWaive }: Props) {
  const billed = ledger.items.reduce((sum, row) => sum + row.amount, 0);
  const paid = ledger.items.reduce((sum, row) => sum + row.paid, 0);
  // A viewer with neither capability (a parent, or an admin with view_fees but
  // not record/edit) gets no buttons in the last column — so it stops claiming
  // to hold actions and carries each row's state instead. Dropping the column
  // outright would lose the "Paid" marker, which is worth keeping.
  const readOnly = !canRecord && !canWaive;

  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2.5 font-medium">Fee</th>
            <th className="px-3 py-2.5 font-medium text-right">Billed</th>
            <th className="px-3 py-2.5 font-medium text-right">Paid</th>
            <th className="px-3 py-2.5 font-medium text-right">Balance</th>
            <th className="px-3 py-2.5 font-medium text-right">
              {readOnly ? "Status" : "Actions"}
            </th>
          </tr>
        </thead>
        <tbody>
          {ledger.items.map((row) => (
            <LedgerRow
              key={row.fee_item.id}
              row={row}
              studentId={ledger.student.id}
              studentName={studentName}
              waiverId={waiverIds.get(row.fee_item.id) ?? null}
              canRecord={canRecord}
              canWaive={canWaive}
            />
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-n-200 bg-n-50">
            <td className="px-3 py-2.5 text-sm font-medium text-ink">Total</td>
            <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums text-n-500">
              {formatNaira(billed)}
            </td>
            <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums text-n-500">
              {formatNaira(paid)}
            </td>
            {/* Read off the server's own total rather than summing the rows:
                waived lines contribute 0 and the backend is the authority on
                that, so a mismatch here would be a bug worth seeing. */}
            <td className="px-3 py-2.5 text-right font-mono text-sm font-semibold tabular-nums text-ink">
              {formatNaira(ledger.total_balance)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
