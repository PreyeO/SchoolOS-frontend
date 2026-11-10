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

// Date-only, inclusive; both lists take them.
interface DateBounds {
  created_at_after?: string;
  created_at_before?: string;
}

export interface TopUpFilters extends DateBounds {
  page: number;
  status?: TopUpStatus;
}

export async function getTopUps(filters: TopUpFilters): Promise<PaginatedResponse<WalletTopUp>> {
  const { data } = await apiClient.get<PaginatedResponse<WalletTopUp>>(WALLET_ENDPOINTS.TOPUPS(), { params: filters });
  return data;
}

export interface LedgerFilters extends DateBounds {
  page: number;
  type?: WalletTransactionType;
}

// The server filters by type, so each tab is its own request (the handoff
// says not to split one ledger page in the client: the page counts would lie).
export async function getWalletTransactions(filters: LedgerFilters): Promise<PaginatedResponse<WalletTransaction>> {
  const { data } = await apiClient.get<PaginatedResponse<WalletTransaction>>(WALLET_ENDPOINTS.TRANSACTIONS(), {
    params: filters,
  });
  return data;
}

// Platform staff only (adjust_school_wallets). Signed credits: negative
// removes. A debit the balance can't cover is refused; a reused key too.
export interface WalletAdjustmentPayload {
  school_id: string;
  credits: number;
  reason: string;
  idempotency_key: string;
}

export async function adjustSchoolWallet(payload: WalletAdjustmentPayload): Promise<WalletTransaction> {
  const { data } = await apiClient.post<WalletTransaction>(WALLET_ENDPOINTS.ADJUSTMENTS(), payload);
  return data;
}

// Verifies the charge with Paystack and credits the wallet when it's paid.
// Accepts reference or trxref; also used to re-check a pending top-up.
export async function confirmTopUp(reference: string): Promise<WalletTopUp> {
  const { data } = await apiClient.get<WalletTopUp>(WALLET_ENDPOINTS.TOPUP_RETURN(), { params: { reference } });
  return data;
}
