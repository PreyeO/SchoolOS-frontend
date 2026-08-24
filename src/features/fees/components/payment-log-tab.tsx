"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatNaira } from "@/lib/text/format-naira";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { usePayments } from "../hooks/use-arrears";
import { useDownloadReceipt } from "../hooks/use-payment-mutations";
import { paymentMethodLabel } from "../lib/payment-methods";

const PAGE_SIZE = 25;

// Every payment the school has taken, newest first.
//
// The status filter exists because the enum does, not because manual entries use
// it: everything recorded at the desk is created successful. Pending and failed
// only ever appear once a payment gateway lands, so the filter is a no-op today
// and correct tomorrow.
export function PaymentLogTab() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const payments = usePayments(page, PAGE_SIZE, status);
  const download = useDownloadReceipt();

  function changeStatus(next: string) {
    setStatus(next || null);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-xl border border-n-200 bg-white p-4">
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
      </div>

      {payments.isPending ? (
        <p className="text-sm text-n-400" role="status">Loading payments…</p>
      ) : payments.isError ? (
        <ErrorState error={payments.error} resourceLabel="payments" />
      ) : payments.data.results.length === 0 ? (
        <p className="text-sm text-n-400 italic">
          {status ? "No payments with that status." : "No payments recorded yet."}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
                  <th className="px-3 py-2.5 font-medium">Receipt</th>
                  <th className="px-3 py-2.5 font-medium">Student</th>
                  <th className="px-3 py-2.5 font-medium">Fee</th>
                  <th className="px-3 py-2.5 font-medium">Method</th>
                  <th className="px-3 py-2.5 font-medium">Recorded</th>
                  <th className="px-3 py-2.5 font-medium text-right">Amount</th>
                  <th className="px-3 py-2.5 font-medium text-right">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.data.results.map((payment) => (
                  <tr key={payment.id} className="border-b border-n-100 last:border-0">
                    <td className="px-3 py-2.5 font-mono text-xs text-n-600">
                      {payment.receipt_number}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-ink">
                      {payment.student.user.first_name} {payment.student.user.last_name}
                      <span className="ml-1.5 font-mono text-xs text-n-400">
                        {payment.student.admission_number}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-n-500">{payment.fee_item_name}</td>
                    <td className="px-3 py-2.5 text-sm text-n-500">
                      {paymentMethodLabel(payment.method)}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-n-500">
                      {formatTimestamp(payment.created_at)}
                    </td>
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
