"use client";

import { Download } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/text/format-naira";
// created_at is a full ISO timestamp, not a plain date — formatDate would append
// a midnight to it and render "Invalid Date". Two payments against different fees
// on the same afternoon are also common, so the time earns its place.
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useDownloadReceipt } from "../hooks/use-payment-mutations";
import { paymentMethodLabel } from "../lib/payment-methods";
import type { Payment } from "../types";

interface Props {
  payments: Payment[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
}

// Everything this student has paid, across every term — not filtered to the
// selected one. At the desk the question is usually "what has this family
// already paid us", and a receipt someone needs reprinted is as likely to be
// from last term as this one.
export function PaymentHistory({ payments, isPending, isError, error }: Props) {
  const download = useDownloadReceipt();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading payments…</p>;
  }
  if (isError) {
    return <ErrorState error={error} resourceLabel="this student's payments" />;
  }
  if (!payments || payments.length === 0) {
    return <p className="text-sm text-n-400 italic">No payments recorded for this student yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2.5 font-medium">Receipt</th>
            <th className="px-3 py-2.5 font-medium">Fee</th>
            <th className="px-3 py-2.5 font-medium">Method</th>
            <th className="px-3 py-2.5 font-medium">Date</th>
            <th className="px-3 py-2.5 font-medium text-right">Amount</th>
            <th className="px-3 py-2.5 font-medium text-right">Receipt</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-n-100 last:border-0">
              <td className="px-3 py-2.5 font-mono text-xs text-n-600">{payment.receipt_number}</td>
              <td className="px-3 py-2.5 text-sm text-ink">{payment.fee_item_name}</td>
              <td className="px-3 py-2.5 text-sm text-n-500">{paymentMethodLabel(payment.method)}</td>
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
  );
}
