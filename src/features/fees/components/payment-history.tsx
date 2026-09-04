"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { TermPicker } from "@/components/shared/term-picker";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useTermSelection } from "@/lib/school/use-term-selection";
import { formatNaira } from "@/lib/text/format-naira";
// created_at is a full ISO timestamp, not a plain date — formatDate would append
// a midnight to it and render "Invalid Date". Two payments against different fees
// on the same afternoon are also common, so the time earns its place.
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useFeeItemsForPeriod } from "../hooks/use-fee-items";
import { useStudentPayments } from "../hooks/use-student-ledger";
import { useDownloadReceipt } from "../hooks/use-payment-mutations";
import { paymentMethodLabel } from "../lib/payment-methods";

const PAGE_SIZE = 10;

interface Props {
  studentId: string;
  // Populating the fee-item filter means listing this school's fee items
  // (GET /fee-items/), which requires the admin-only view_fees SCHOOL
  // permission — a real permission a bursar holds but a parent/student
  // viewing their own child's/own history never does (they're allowed to see
  // payment history at all as a narrower, separate allowance). Defaults to
  // false so those callers get status filtering and pagination without
  // risking a 403 on a request they can't make.
  canFilterByFeeItem?: boolean;
}

// Everything this student has paid, across every term — not filtered to the
// selected one. At the desk the question is usually "what has this family
// already paid us", and a receipt someone needs reprinted is as likely to be
// from last term as this one.
export function PaymentHistory({ studentId, canFilterByFeeItem = false }: Props) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [feeItemId, setFeeItemId] = useState<string | null>(null);
  const payments = useStudentPayments(studentId, true, page, PAGE_SIZE, status, feeItemId);
  const download = useDownloadReceipt();

  // Own term — defaults to current, but changeable — only resolved (and only
  // fetched) when the fee-item filter is actually offered. Fee items are
  // scoped to (class, academic_period) and don't roll forward between terms,
  // so a fee item from a past term is a different record than this term's
  // same-named one; the picker is what lets the filter reach it. Payments
  // themselves have no period field or filter on the backend at all — this
  // is the only way to narrow by period, by picking a specific period's fee
  // item rather than the period directly.
  const term = useTermSelection();
  const feeItems = useFeeItemsForPeriod(canFilterByFeeItem ? term.periodId : null);
  const feeItemOptions = [...(feeItems.data ?? [])].sort((a, b) =>
    a.name === b.name ? a.class_name.localeCompare(b.class_name) : a.name.localeCompare(b.name),
  );

  function changeStatus(next: string) {
    setStatus(next || null);
    setPage(1);
  }

  function changeTerm(next: string) {
    term.setPeriodId(next);
    // Last term's selected fee item id means nothing against this term's
    // options — it wouldn't match any of them, silently filtering to zero
    // results rather than reading as an obvious leftover.
    setFeeItemId(null);
    setPage(1);
  }

  function changeFeeItem(next: string) {
    setFeeItemId(next || null);
    setPage(1);
  }

  const hasFilter = !!status || !!feeItemId;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-n-500">Status</span>
          <Select
            value={status ?? ""}
            onChange={(e) => changeStatus(e.target.value)}
            aria-label="Payment status"
            className="min-w-36"
          >
            <option value="">All</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>
        </label>
        {canFilterByFeeItem && (
          <>
            <TermPicker groups={term.groups} value={term.periodId} onChange={changeTerm} />
            <label className="flex items-center gap-2 text-sm">
              <span className="text-n-500">Fee item</span>
              <Select
                value={feeItemId ?? ""}
                onChange={(e) => changeFeeItem(e.target.value)}
                aria-label="Fee item"
                disabled={feeItems.isPending}
                className="min-w-56"
              >
                <option value="">All</option>
                {feeItemOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.class_name} · {item.session_name} {item.academic_period_name}
                  </option>
                ))}
              </Select>
            </label>
          </>
        )}
      </div>

      {payments.isPending ? (
        <p className="text-sm text-n-400" role="status">Loading payments…</p>
      ) : payments.isError ? (
        <ErrorState error={payments.error} resourceLabel="this student's payments" />
      ) : payments.data.results.length === 0 ? (
        <p className="text-sm text-n-400 italic">
          {hasFilter ? "No payments match this filter." : "No payments recorded for this student yet."}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
                  <th className="px-3 py-2.5 font-medium">Receipt</th>
                  <th className="px-3 py-2.5 font-medium">Fee</th>
                  <th className="px-3 py-2.5 font-medium">Method</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5 font-medium text-right">Amount</th>
                  <th className="px-3 py-2.5 font-medium text-right">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.data.results.map((payment) => (
                  <tr key={payment.id} className="border-b border-n-100 last:border-0">
                    <td className="px-3 py-2.5 font-mono text-xs text-n-600">{payment.receipt_number}</td>
                    <td className="px-3 py-2.5 text-sm text-ink">{payment.fee_item_name}</td>
                    <td className="px-3 py-2.5 text-sm text-n-500">{paymentMethodLabel(payment.method)}</td>
                    <td className="px-3 py-2.5 text-sm text-n-500 capitalize">{payment.status}</td>
                    <td className="px-3 py-2.5 text-sm text-n-500">{formatTimestamp(payment.created_at)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums text-ink">
                      {formatNaira(payment.amount)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Download receipt ${payment.receipt_number}`}
                        disabled={download.isPending}
                        onClick={() =>
                          download.mutate({
                            paymentId: payment.id,
                            receiptNumber: payment.receipt_number,
                          })
                        }
                      >
                        <Download className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            page={page}
            pageSize={PAGE_SIZE}
            count={payments.data.count}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
