"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { goToPayment } from "@/lib/go-to-payment";

import { confirmTopUp, startTopUp } from "../api/wallet-api";
import { refreshWallet } from "./use-wallet-queries";

// Both run with networkMode "always": paying is online-only, and a paused
// top-up resuming later would bounce the admin to Paystack out of nowhere.

// Starts checkout. The browser leaves for Paystack on success. Server errors
// (bounds, the ₦100 minimum charge) are toasted as written.
export function useStartTopUp() {
  return useMutation({
    mutationFn: startTopUp,
    networkMode: "always",
    onSuccess: (topup) => {
      if (topup.payment_link) {
        goToPayment(topup.payment_link);
      } else {
        toast.error("Paystack didn't return a payment page. Please try again.");
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// Re-checks a top-up still marked pending (e.g. the admin closed the tab
// before Paystack sent them back). The same verify call the return page makes.
export function useRecheckTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmTopUp,
    networkMode: "always",
    onSuccess: (topup) => {
      refreshWallet(queryClient);
      if (topup.status === "successful") toast.success(`${topup.credits_purchased.toLocaleString()} credits added.`);
      else if (topup.status === "failed") toast.error("Paystack says this payment didn't go through.");
      else toast("Paystack still hasn't confirmed this payment.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
