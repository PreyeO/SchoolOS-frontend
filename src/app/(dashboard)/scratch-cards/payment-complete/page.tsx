import type { Metadata } from "next";

import { PaymentCompletePage } from "@/features/scratch-cards/components/payment-complete-page";

export const metadata: Metadata = { title: "Result PIN Payment" };

// Paystack's return URL. The backend builds it from
// FRONTEND_SCRATCH_CARD_REDIRECT_URL, which must be "/scratch-cards/payment-complete".
// Paystack appends ?gateway=paystack&reference=…&trxref=…; read server-side
// and passed through whole, same as the attendance and fees routes.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = Object.fromEntries(
    Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" ? [[key, value]] : [])),
  );
  return <PaymentCompletePage params={params} />;
}
