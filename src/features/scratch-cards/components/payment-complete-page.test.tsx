// @vitest-environment jsdom
import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import { signInAs } from "@/test/fixtures";
import { apiUrl, server } from "@/test/msw/server";

import type { CardPurchase } from "../types";
import { PaymentCompletePage } from "./payment-complete-page";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const purchase = (verified: boolean | null, revealedAt: string | null = null) =>
  ({ id: "p1", quantity: 1, academic_session_name: "2026/2027", verification_api_verified: verified, pins_revealed_at: revealedAt }) as CardPurchase;

// The payment check, and a reveal that hands the PINs out once (as the server
// does) then an empty list. `revealedAfter` plays a reveal whose response was
// lost: from then on the purchase comes back stamped.
function serve(verified: boolean | null, opts: { revealedAt?: string | null; pinsGone?: boolean; revealedAfter?: boolean } = {}) {
  const calls = { confirm: [] as string[], reveal: 0 };
  server.use(
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.PAYMENT_RETURN()), ({ request }) => {
      calls.confirm.push(new URL(request.url).search);
      const stamped = opts.revealedAt ?? (opts.revealedAfter && calls.reveal > 0 ? "2026-11-11T10:00:00Z" : null);
      return HttpResponse.json(purchase(verified, stamped));
    }),
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.REVEAL("p1")), () => {
      calls.reveal += 1;
      const first = calls.reveal === 1 && !opts.pinsGone;
      return HttpResponse.json({ cards: first ? [{ serial: "ABCD-EFGH-IJ", pin: "4821930576" }] : [] });
    }),
  );
  return calls;
}

function open(params: Record<string, string> = { gateway: "paystack", reference: "ref_1", trxref: "ref_1" }) {
  signInAs("m1", ["admin"]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <PaymentCompletePage params={params} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

const showPins = async () => {
  await userEvent.click(await screen.findByRole("button", { name: "Show the PINs now" }));
  await userEvent.click(screen.getByRole("button", { name: "Show 1 card as slips" }));
};

describe("PaymentCompletePage", () => {
  // Backend 7ebd0d3: keeping cards in stock is the default and must not reveal.
  it("confirms into stock and offers Issue cards, without revealing anything", async () => {
    const calls = serve(true);
    open();
    expect(await screen.findByText(/now in stock/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Issue cards" })).toHaveAttribute("href", "/scratch-cards/issue");
    expect(calls.confirm[0]).toContain("reference=ref_1");
    expect(calls.reveal).toBe(0);
  });

  it("explains the trade-off before revealing, and 'Keep them in stock' reveals nothing", async () => {
    const calls = serve(true);
    open();
    await userEvent.click(await screen.findByRole("button", { name: "Show the PINs now" }));
    expect(screen.getByText(/can.t be issued to a student later/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Keep them in stock" }));
    expect(calls.reveal).toBe(0);
  });

  it("reveals once, only after confirming, and shows the slips", async () => {
    const calls = serve(true);
    open();
    await showPins();
    expect(await screen.findByText("4821930576")).toBeInTheDocument();
    expect(calls.reveal).toBe(1);
  });

  it("on an empty reveal with no stamp, says the window passed and the cards are still stock", async () => {
    serve(true, { pinsGone: true });
    open();
    await showPins();
    expect(await screen.findByText(/15 minutes have passed/)).toBeInTheDocument();
  });

  // A reveal whose response was lost: the retry is empty, but the re-read
  // purchase is stamped, so it must NOT claim the cards are still in stock.
  it("on an empty reveal after a lost one, re-reads the purchase and says they were shown", async () => {
    serve(true, { pinsGone: true, revealedAfter: true });
    open();
    await showPins();
    expect(await screen.findByText(/already shown as anonymous slips/)).toBeInTheDocument();
    expect(screen.queryByText(/15 minutes have passed/)).not.toBeInTheDocument();
  });

  it("offers nothing to reveal when the PINs were already shown on an earlier visit", async () => {
    const calls = serve(true, { revealedAt: "2026-11-09T10:00:00Z" });
    open();
    expect(await screen.findByText(/already shown as anonymous slips/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Show the PINs now" })).not.toBeInTheDocument();
    expect(calls.reveal).toBe(0);
  });

  it("never offers PINs when the payment failed", async () => {
    const calls = serve(false);
    open();
    expect(await screen.findByText(/wasn.t completed, so no cards were created/)).toBeInTheDocument();
    expect(screen.getByText("ref_1")).toBeInTheDocument();
    expect(calls.reveal).toBe(0);
  });

  it("waits on a pending payment and checks again on request", async () => {
    const calls = serve(null);
    open();
    await userEvent.click(await screen.findByRole("button", { name: "Check again" }));
    expect(calls.confirm.length).toBeGreaterThanOrEqual(2);
    expect(calls.reveal).toBe(0);
  });

  it("doesn't call the API without a payment reference", () => {
    const calls = serve(true);
    open({});
    expect(screen.getByText(/opens after paying for cards online/)).toBeInTheDocument();
    expect(calls.confirm).toEqual([]);
  });

  // Flutterwave's return carries tx_ref and its own status, no `reference`.
  it("confirms a Flutterwave return by tx_ref, passing its status through, and names Flutterwave", async () => {
    const calls = serve(null);
    open({ gateway: "flutterwave", status: "successful", tx_ref: "SCC-FLW1", transaction_id: "9001" });
    // The redirect's "successful" is not proof: a pending verify still says so.
    expect(await screen.findByText(/Flutterwave hasn.t confirmed this payment yet/)).toBeInTheDocument();
    const query = new URLSearchParams(calls.confirm[0]);
    expect(query.get("tx_ref")).toBe("SCC-FLW1");
    expect(query.get("status")).toBe("successful");
    expect(calls.reveal).toBe(0);
  });
});
