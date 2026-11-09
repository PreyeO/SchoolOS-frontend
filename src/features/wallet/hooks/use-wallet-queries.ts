"use client";

import { keepPreviousData, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { confirmTopUp, getTopUps, getWallet, getWalletTransactions } from "../api/wallet-api";
import type { TopUpStatus, WalletTransactionType } from "../types";

// Not in query-persistence's allowlist: a balance read from device storage
// would be stale exactly when it matters (right after a send or a top-up).
export const WALLET_KEY = ["wallet"] as const;
const SUMMARY_KEY = [...WALLET_KEY, "summary"] as const;
const TOPUPS_KEY = [...WALLET_KEY, "topups"] as const;
const LEDGER_KEY = [...WALLET_KEY, "transactions"] as const;

// Everything a credit or debit changes. Deliberately not the whole WALLET_KEY:
// that would also re-run the payment-return confirmation query.
export function refreshWallet(queryClient: QueryClient) {
  for (const queryKey of [SUMMARY_KEY, TOPUPS_KEY, LEDGER_KEY]) {
    queryClient.invalidateQueries({ queryKey });
  }
}

// Read fresh on every mount: the price and bounds are live server settings,
// and the balance moves whenever a text is sent.
export function useWallet({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ queryKey: SUMMARY_KEY, queryFn: getWallet, staleTime: 0, enabled });
}

export function useTopUps(page: number, status?: TopUpStatus) {
  return useQuery({
    queryKey: [...TOPUPS_KEY, page, status ?? "all"],
    queryFn: () => getTopUps(page, status),
    placeholderData: keepPreviousData,
  });
}

export function useWalletTransactions(page: number, type?: WalletTransactionType) {
  return useQuery({
    queryKey: [...LEDGER_KEY, page, type ?? "all"],
    queryFn: () => getWalletTransactions(page, type),
    placeholderData: keepPreviousData,
  });
}

// Paystack's return. A query keyed by the reference, so StrictMode's double
// mount can't send it twice. Not retried: "pending" is a real answer to show
// with a "Check again" button, not a failure to hammer.
export function useTopUpConfirmation(reference: string | null) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: [...WALLET_KEY, "return", reference],
    queryFn: async () => {
      const topup = await confirmTopUp(reference as string);
      if (topup.status === "successful") refreshWallet(queryClient);
      return topup;
    },
    enabled: !!reference,
    retry: false,
    staleTime: Infinity,
  });
}
