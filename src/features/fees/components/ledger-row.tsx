"use client";

import { BadgeCheck, HandCoins, Undo2 } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/text/format-naira";

import { useCreateWaiver, useRecordPayment, useRemoveWaiver } from "../hooks/use-payment-mutations";
import type { StudentLedgerItem } from "../types";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { WaiveFeeDialog } from "./waive-fee-dialog";

interface Props {
  row: StudentLedgerItem;
  studentId: string;
  studentName: string;
  // Waiver id for this row's fee item, recovered from the waiver list — the
  // ledger itself only says *whether* a row is waived, not which record to
  // delete. Null when the caller can't read waivers (no view_fees).
  waiverId: string | null;
  canRecord: boolean;
  canWaive: boolean;
}

export function LedgerRow({ row, studentId, studentName, waiverId, canRecord, canWaive }: Props) {
  const recordPayment = useRecordPayment();
  const createWaiver = useCreateWaiver();
  const removeWaiver = useRemoveWaiver();

  const feeName = row.fee_item.name;
  const settled = !row.is_waived && row.balance === 0;

  return (
    <tr className="border-b border-n-100 last:border-0">
      <td className="px-3 py-2.5 text-sm text-ink">
        {feeName}
        {row.is_waived && (
          <span className="ml-2 rounded-full border border-grass/40 bg-grass/10 px-1.5 py-0.5 text-[10px] font-medium text-grass">
            Waived
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums text-n-500">
        {formatNaira(row.amount)}
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums text-n-500">
        {row.paid > 0 ? formatNaira(row.paid) : "—"}
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-sm font-medium tabular-nums text-ink">
        {row.is_waived ? <span className="text-n-400">—</span> : formatNaira(row.balance)}
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="inline-flex items-center justify-end gap-1">
          {row.is_waived ? (
            canWaive && waiverId ? (
              <ConfirmDeleteDialog
                trigger={
                  <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                    <Undo2 className="size-3.5 mr-1" /> Un-waive
                  </Button>
                }
                title={`Bill ${feeName} again?`}
                description={`${studentName} will owe the full ${formatNaira(row.amount)} for this fee once more.`}
                confirmLabel="Un-waive"
                isPending={removeWaiver.isPending}
                onConfirm={() => removeWaiver.mutate({ id: waiverId, feeName })}
              />
            ) : null
          ) : settled ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-grass">
              <BadgeCheck className="size-3.5" /> Paid
            </span>
          ) : !canRecord && !canWaive ? (
            // Read-only viewer (a parent, or a view-only admin): no buttons
            // belong here, but a blank cell reads as missing data. The row's
            // own state is the useful thing to show instead.
            <span className="text-xs font-medium text-amber">Outstanding</span>
          ) : (
            <>
              {canRecord && (
                <RecordPaymentDialog
                  trigger={
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
                      <HandCoins className="size-3.5 mr-1" /> Record
                    </Button>
                  }
                  feeName={feeName}
                  studentName={studentName}
                  amount={row.amount}
                  paid={row.paid}
                  remaining={row.balance}
                  isPending={recordPayment.isPending}
                  onSave={(values) =>
                    recordPayment.mutateAsync({
                      student_id: studentId,
                      fee_item_id: row.fee_item.id,
                      ...values,
                    })
                  }
                />
              )}
              {canWaive && (
                <WaiveFeeDialog
                  trigger={
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                      Waive
                    </Button>
                  }
                  feeName={feeName}
                  studentName={studentName}
                  amount={row.amount}
                  paid={row.paid}
                  isPending={createWaiver.isPending}
                  onSave={({ reason }) =>
                    createWaiver.mutateAsync({
                      student_id: studentId,
                      fee_item_id: row.fee_item.id,
                      ...(reason ? { reason } : {}),
                    })
                  }
                />
              )}
            </>
          )}
        </span>
      </td>
    </tr>
  );
}
