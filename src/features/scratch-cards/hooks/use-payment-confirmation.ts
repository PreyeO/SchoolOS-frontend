"use client";

import { useQuery } from "@tanstack/react-query";

import { confirmCardPayment } from "../api/scratch-cards-api";
import { SCRATCH_CARDS_KEY } from "./use-scratch-card-queries";

export type PaymentOutcome = "paid" | "failed" | "pending";

// Paystack's return: verifies the charge (and creates the cards when paid).
//
// A query rather than an effect-fired call, keyed by the reference, so React's
// dev double-mount and a re-render can't send it twice. Not retried: a
// "pending" answer is a real state to show, with a "Check again" button
// (refetch), not a failure to hammer.
export function usePaymentConfirmation(params: Record<string, string>) {
  const reference = params.reference ?? params.tx_ref ?? params.trxref ?? null;

  const query = useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "payment-return", reference],
    queryFn: () => confirmCardPayment(params),
    enabled: !!reference,
    retry: false,
    staleTime: Infinity,
  });

  // verification_api_verified is the only signal the handoff says to trust.
  const outcome: PaymentOutcome | null = query.data
    ? query.data.verification_api_verified === true
      ? "paid"
      : query.data.verification_api_verified === false
        ? "failed"
        : "pending"
    : null;

  return { ...query, reference, outcome };
}
