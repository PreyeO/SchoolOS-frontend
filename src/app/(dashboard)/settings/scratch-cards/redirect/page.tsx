import { redirect } from "next/navigation";

// An alias for the gateway's return (Paystack or Flutterwave). The hosted dev backend was configured with
// FRONTEND_SCRATCH_CARD_REDIRECT_URL=/settings/scratch-cards/redirect, which
// 404'd a real payment. The intended value is /scratch-cards/payment-complete;
// this forwards the old path there with the gateway's query intact, so a backend
// set either way works. Server-side, so it happens before any access guard
// decides about a /settings URL.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const query = new URLSearchParams(
    Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" ? [[key, value]] : [])),
  ).toString();
  redirect(`/scratch-cards/payment-complete${query ? `?${query}` : ""}`);
}
