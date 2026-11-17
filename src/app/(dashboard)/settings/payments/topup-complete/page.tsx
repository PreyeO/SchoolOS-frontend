import type { Metadata } from "next";

import { TopUpCompletePage } from "@/features/wallet/components/top-up-complete-page";

export const metadata: Metadata = { title: "SMS Credit Payment" };

// The gateway's return URL for a wallet top-up. The backend builds it from
// FRONTEND_WALLET_REDIRECT_URL, which must be "/settings/payments/topup-complete",
// plus ?gateway=paystack|flutterwave. Paystack then appends reference & trxref,
// Flutterwave tx_ref, status & transaction_id; read server-side and passed
// through, same as the result-card return.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = Object.fromEntries(
    Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" ? [[key, value]] : [])),
  );
  return <TopUpCompletePage params={params} />;
}
