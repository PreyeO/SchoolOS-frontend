"use client";

import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { gatewayLabel, returnReference } from "@/lib/payments/gateways";

import { useTopUpConfirmation, useWallet } from "../hooks/use-wallet-queries";
import { formatCredits } from "../lib/describe-transaction";

const BACK = (
  <Link href="/settings/payments" className="text-sm text-primary hover:underline">
    Back to SMS Wallet
  </Link>
);

// Where the gateway sends the admin after a top-up. The backend builds the URL
// from FRONTEND_WALLET_REDIRECT_URL (this route's path) plus ?gateway=…;
// Paystack then adds reference/trxref, Flutterwave tx_ref and a status.
// Nothing is shown as settled until the API has verified the charge (it also
// credits the wallet when paid); a Flutterwave "successful" alone proves nothing.
export function TopUpCompletePage({ params }: { params: Record<string, string> }) {
  const reference = returnReference(params);
  const { data: topup, isPending, isError, error, refetch, isFetching } = useTopUpConfirmation(reference, params.status);
  const gateway = gatewayLabel(topup?.gateway ?? params.gateway);
  // Not fetched until the credit has landed, and not shown mid-refetch: a
  // balance read alongside the confirmation would be the old one, shown as "now".
  const credited = topup?.status === "successful";
  const wallet = useWallet({ enabled: credited });
  const balance = credited && wallet.data && !wallet.isFetching ? wallet.data.balance : null;

  let body: React.ReactNode;
  if (!reference) {
    body = <p className="text-sm text-n-500">This page opens after paying for SMS credits online. {BACK}</p>;
  } else if (isPending) {
    body = <p className="text-sm text-n-400" role="status">Confirming your payment with {gateway}…</p>;
  } else if (isError) {
    body = <ErrorState error={error} resourceLabel="this payment" />;
  } else if (topup.status === "pending") {
    body = (
      <div className="space-y-3">
        <p className="text-sm text-ink">
          {gateway} hasn&rsquo;t confirmed this payment yet, so no credits have been added.
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Checking…" : "Check again"}
        </Button>
      </div>
    );
  } else if (topup.status === "failed") {
    body = (
      <p className="text-sm text-ink">
        {gateway} has no completed payment for this, so no credits were added. If money did leave your account, it
        may still come through; check again from the Top-ups list later, or contact SchoolOS support with reference{" "}
        <span className="font-mono whitespace-nowrap">{topup.gateway_reference}</span>. {BACK}
      </p>
    );
  } else {
    body = (
      <div className="space-y-3" role="status">
        <p className="text-sm text-ink">
          Payment confirmed: {formatCredits(topup.credits_purchased)} added.
          {balance !== null ? ` Your balance is now ${formatCredits(balance)}.` : ""}
        </p>
        {BACK}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">SMS credit payment</h1>
      {body}
    </div>
  );
}
