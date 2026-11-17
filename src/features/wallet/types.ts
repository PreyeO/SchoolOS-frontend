import type { UserMinimal } from "@/lib/api/profile-summary";
import type { PaymentGateway } from "@/lib/payments/gateways";

// GET /api/wallet/. Credits are whole numbers; prices are integer naira.
export interface WalletSummary {
  balance: number;
  credit_price: number;
  min_topup_credits: number;
  max_topup_credits: number;
}

export type TopUpStatus = "pending" | "successful" | "failed";

// One row of GET /api/wallet/topups/. credits_purchased and credit_price are
// snapshotted when the checkout starts; amount = their product.
export interface WalletTopUp {
  id: string;
  amount: number;
  credits_purchased: number;
  credit_price: number;
  gateway: PaymentGateway;
  gateway_reference: string;
  // The handoff's signal for the return page: successful = credited.
  status: TopUpStatus;
  payment_link: string | null;
  // Tracking only. A credited top-up can still be false here.
  is_fully_verified: boolean;
  initiated_by: UserMinimal | null;
  created_at: string;
}

export interface StartTopUpPayload {
  credits: number;
  gateway: PaymentGateway;
}

export type WalletTransactionType = "topup" | "debit" | "refund" | "adjustment";

// One ledger row. `credits` is signed: debits are negative.
export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  credits: number;
  balance_after: number;
  // Machine reference: the gateway reference for a top-up,
  // "debit:issuance:<batch>" for a card send, "refund:<message>" for a refund.
  reference: string;
  topup: string | null;
  message: string | null;
  // Set for adjustments (the platform admin's reason) and refunds.
  note: string;
  created_by: UserMinimal | null;
  created_at: string;
}
