"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { gatewayLabel } from "@/lib/payments/gateways";

import { usePaymentConfirmation } from "../hooks/use-payment-confirmation";
import { PaidPurchasePanel } from "./paid-purchase-panel";

const BACK = (
  <Link href="/scratch-cards" className="text-sm text-primary hover:underline">
    Back to Result Cards
  </Link>
);

// Where the gateway (Paystack or Flutterwave, named in ?gateway=) sends the
// admin after checkout (FRONTEND_SCRATCH_CARD_REDIRECT_URL on the backend must
// be this path). Confirms the payment. It no longer reveals the PINs on
// arrival (backend 7ebd0d3): paid cards go into stock by default, and showing
// them as anonymous slips is a separate, confirmed choice in PaidPurchasePanel.
export function PaymentCompletePage({ params }: { params: Record<string, string> }) {
  const { data: purchase, outcome, reference, isPending, isError, error, refetch, isFetching } =
    usePaymentConfirmation(params);
  const gateway = gatewayLabel(purchase?.gateway ?? params.gateway);

  let body: React.ReactNode;
  if (!reference) {
    body = <p className="text-sm text-n-500">This page opens after paying for cards online. {BACK}</p>;
  } else if (isPending) {
    body = <p className="text-sm text-n-400" role="status">Confirming your payment with {gateway}…</p>;
  } else if (isError) {
    body = <ErrorState error={error} resourceLabel="this payment" />;
  } else if (outcome === "pending") {
    body = (
      <div className="space-y-3">
        <p className="text-sm text-ink">{gateway} hasn&rsquo;t confirmed this payment yet. The cards are created once it does.</p>
        <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Checking…" : "Check again"}
        </Button>
      </div>
    );
  } else if (outcome === "failed") {
    body = (
      <p className="text-sm text-ink">
        The payment wasn&rsquo;t completed, so no cards were created. If money left your account, contact SchoolOS
        support with reference <span className="font-mono">{reference}</span>. {BACK}
      </p>
    );
  } else if (purchase) {
    body = <PaidPurchasePanel purchase={purchase} onRevealedEmpty={() => refetch()} isRefreshing={isFetching} />;
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">Result card payment</h1>
      {body}
    </div>
  );
}
