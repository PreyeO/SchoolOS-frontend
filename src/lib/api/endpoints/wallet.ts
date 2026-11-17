// --- SMS wallet (backend docs/wallet-sms-issuance-frontend-handoff.md §3) ---
//
// A school's balance of SMS credits: one credit is one SMS page. Every route
// here needs manage_wallet, except the payment return, which is public.

export const WALLET_ENDPOINTS = {
  // { balance, credit_price, min_topup_credits, max_topup_credits }.
  // Doesn't create a wallet; balance is 0 until the first top-up.
  SUMMARY: () => `/api/wallet/`,
  // POST { credits, gateway: "paystack" | "flutterwave" } → the top-up with payment_link.
  // Never send a naira amount: the server charges credits × credit_price.
  // GET lists top-ups, newest first. ?status=pending|successful|failed.
  TOPUPS: () => `/api/wallet/topups/`,
  // Public. The return page passes ?reference= (Paystack) or ?tx_ref= with
  // ?status= (Flutterwave) through; this verifies the charge with the top-up's
  // own gateway and credits the wallet. Safe to call repeatedly.
  TOPUP_RETURN: () => `/api/wallet/topups/redirect/`,
  // The ledger, newest first. ?type=topup|debit|refund|adjustment.
  TRANSACTIONS: () => `/api/wallet/transactions/`,
  // Platform admins only (adjust_school_wallets).
  // POST { school_id, credits (signed), reason, idempotency_key }.
  ADJUSTMENTS: () => `/api/wallet/adjustments/`,
} as const;
