"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";

import { usePaymentConfirmation } from "../hooks/use-payment-confirmation";
import { useRevealPins } from "../hooks/use-scratch-card-mutations";
import type { CardPin } from "../types";
import { PinsSheet } from "./pins-sheet";

const BACK = (
  <Link href="/scratch-cards" className="text-sm text-primary hover:underline">
    Back to Result PINs
  </Link>
);

// Where Paystack sends the admin after checkout (FRONTEND_SCRATCH_CARD_
// REDIRECT_URL on the backend must be this path). Confirms the payment, then
// fetches the PINs exactly once: the server hands them out a single time, so a
// second call would return [] and blank a sheet nobody had saved yet. The ref
// guard holds through React's dev double-run of effects.
export function PaymentCompletePage({ params }: { params: Record<string, string> }) {
  const { data: purchase, outcome, reference, isPending, isError, error, refetch, isFetching } =
    usePaymentConfirmation(params);
  const reveal = useRevealPins();
  const requested = useRef(false);
  const [pins, setPins] = useState<CardPin[] | null>(null);

  useEffect(() => {
    if (outcome !== "paid" || !purchase || requested.current) return;
    requested.current = true;
    reveal.mutate(purchase.id, { onSuccess: setPins });
  }, [outcome, purchase, reveal]);

  let body: React.ReactNode;
  if (!reference) {
    body = <p className="text-sm text-n-500">This page opens after paying for cards on Paystack. {BACK}</p>;
  } else if (isPending) {
    body = <p className="text-sm text-n-400" role="status">Confirming your payment with Paystack…</p>;
  } else if (isError) {
    body = <ErrorState error={error} resourceLabel="this payment" />;
  } else if (outcome === "pending") {
    body = (
      <div className="space-y-3">
        <p className="text-sm text-ink">Paystack hasn&rsquo;t confirmed this payment yet. No PINs are shown until it does.</p>
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
  } else if (!pins && reveal.isError) {
    // Retrying is safe: if the first call did reach the server, this one
    // returns [] and the empty-list message below explains what to do.
    body = (
      <div className="space-y-3">
        <p className="text-sm text-ink">Payment confirmed, but the PINs couldn&rsquo;t be loaded.</p>
        <Button type="button" onClick={() => purchase && reveal.mutate(purchase.id, { onSuccess: setPins })}>
          Try again
        </Button>
      </div>
    );
  } else if (!pins) {
    body = <p className="text-sm text-n-400" role="status">Payment confirmed. Getting your PINs…</p>;
  } else if (pins.length === 0) {
    body = (
      <p className="text-sm text-ink">
        Payment confirmed, but these PINs have already been shown once, or more than 15 minutes have passed since the
        cards were created. For any card whose PIN you don&rsquo;t have, use Regenerate in Card stock. {BACK}
      </p>
    );
  } else {
    body = (
      <div className="space-y-4">
        <p className="text-sm text-ink">
          Payment confirmed: {pins.length} card{pins.length === 1 ? "" : "s"} for {purchase?.academic_session_name}.
        </p>
        <PinsSheet pins={pins} sessionName={purchase?.academic_session_name ?? ""} />
        {BACK}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">Result PIN payment</h1>
      {body}
    </div>
  );
}
