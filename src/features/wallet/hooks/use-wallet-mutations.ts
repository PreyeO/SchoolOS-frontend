"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { goToPayment } from "@/lib/go-to-payment";
import { gatewayLabel } from "@/lib/payments/gateways";

import { confirmTopUp, startTopUp } from "../api/wallet-api";
import { refreshWallet } from "./use-wallet-queries";

// Both run with networkMode "always": paying is online-only, and a paused
// top-up resuming later would bounce the admin to checkout out of nowhere.

// Starts checkout. The browser leaves for the chosen gateway on success.
// Server errors (bounds, the ₦100 minimum charge) are toasted as written.
export function useStartTopUp() {
  return useMutation({
    mutationFn: startTopUp,
    networkMode: "always",
    onSuccess: (topup, payload) => {
      if (topup.payment_link) {
        goToPayment(topup.payment_link);
      } else {
        toast.error(`${gatewayLabel(payload.gateway)} didn't return a payment page. Please try again.`);
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// Re-checks a top-up that isn't credited yet (e.g. the admin closed the tab
// before the gateway sent them back). The same verify call the return page
// makes. An unpaid checkout comes back "failed": only "not paid yet".
export function useRecheckTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reference: string) => confirmTopUp(reference),
    networkMode: "always",
    onSuccess: (topup) => {
      refreshWallet(queryClient);
      if (topup.status === "successful") toast.success(`${topup.credits_purchased.toLocaleString()} credits added.`);
      else toast(`${gatewayLabel(topup.gateway)} has no completed payment for this yet. No credits were added.`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
