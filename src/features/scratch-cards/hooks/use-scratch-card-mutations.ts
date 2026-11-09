"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { replaceCard, revealCardPins, startCardPurchase } from "../api/scratch-cards-api";
import { goToPayment } from "@/lib/go-to-payment";
import type { ReplaceCardPayload } from "../types";
import { SCRATCH_CARDS_KEY } from "./use-scratch-card-queries";

// All three run with networkMode "always": none of them may wait as a paused
// mutation. A paused mutation is persisted to device storage along with its
// result once it resumes, and two of these return plaintext PINs.

// Starts checkout. On success the browser leaves for Paystack; nothing else
// needs refreshing because no cards exist until the payment is verified.
export function useStartCardPurchase() {
  return useMutation({
    mutationFn: startCardPurchase,
    networkMode: "always",
    onSuccess: (purchase) => {
      if (purchase.payment_link) {
        goToPayment(purchase.payment_link);
      } else {
        toast.error("Paystack didn't return a payment page. Please try again.");
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// Returns the PINs once. The caller holds them in component state only.
export function useRevealPins() {
  return useMutation({
    mutationFn: revealCardPins,
    networkMode: "always",
    // Drop the PINs from the mutation cache the moment nothing observes them.
    gcTime: 0,
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// Reissues a card to the student it was issued to. Print returns the new PIN
// once; SMS queues a text. The caller owns the idempotency key and resends
// the same one on a retry, so a lost response can't issue twice.
export function useReplaceCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: ReplaceCardPayload & { id: string }) => replaceCard(id, payload),
    networkMode: "always",
    gcTime: 0,
    // Errors are handled by the dialog: a 409 means a print replay whose PINs
    // are gone, which needs its own explanation rather than a bare toast.
    onSettled: () => queryClient.invalidateQueries({ queryKey: SCRATCH_CARDS_KEY }),
  });
}
