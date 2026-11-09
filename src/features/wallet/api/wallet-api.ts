import { apiClient } from "@/lib/api/client";
import { WALLET_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  StartTopUpPayload,
  TopUpStatus,
  WalletSummary,
  WalletTopUp,
  WalletTransaction,
  WalletTransactionType,
} from "../types";

export async function getWallet(): Promise<WalletSummary> {
  const { data } = await apiClient.get<WalletSummary>(WALLET_ENDPOINTS.SUMMARY());
  return data;
}

export async function startTopUp(payload: StartTopUpPayload): Promise<WalletTopUp> {
  const { data } = await apiClient.post<WalletTopUp>(WALLET_ENDPOINTS.TOPUPS(), payload);
  return data;
}

export async function getTopUps(page: number, status?: TopUpStatus): Promise<PaginatedResponse<WalletTopUp>> {
  const { data } = await apiClient.get<PaginatedResponse<WalletTopUp>>(WALLET_ENDPOINTS.TOPUPS(), {
    params: { page, status },
  });
  return data;
}

// The server filters by type, so each tab is its own request (the handoff
// says not to split one ledger page in the client: the page counts would lie).
export async function getWalletTransactions(
  page: number,
  type?: WalletTransactionType,
): Promise<PaginatedResponse<WalletTransaction>> {
  const { data } = await apiClient.get<PaginatedResponse<WalletTransaction>>(WALLET_ENDPOINTS.TRANSACTIONS(), {
    params: { page, type },
  });
  return data;
}

// Verifies the charge with Paystack and credits the wallet when it's paid.
// Accepts reference or trxref; also used to re-check a pending top-up.
export async function confirmTopUp(reference: string): Promise<WalletTopUp> {
  const { data } = await apiClient.get<WalletTopUp>(WALLET_ENDPOINTS.TOPUP_RETURN(), { params: { reference } });
  return data;
}
