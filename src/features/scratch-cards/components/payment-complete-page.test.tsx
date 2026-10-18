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

const purchase = (verified: boolean | null) =>
  ({ id: "p1", academic_session_name: "2026/2027", verification_api_verified: verified }) as CardPurchase;

// Serves the payment check and a reveal that hands the PINs out once, as the
// server does, then an empty list.
function serve(verified: boolean | null) {
  const calls = { confirm: [] as string[], reveal: 0 };
  server.use(
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.PAYMENT_RETURN()), ({ request }) => {
      calls.confirm.push(new URL(request.url).search);
      return HttpResponse.json(purchase(verified));
    }),
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.REVEAL("p1")), () => {
      calls.reveal += 1;
      return HttpResponse.json({ cards: calls.reveal === 1 ? [{ serial: "ABCD-EFGH-IJ", pin: "4821930576" }] : [] });
    }),
  );
  return calls;
}

function open(params: Record<string, string> = { gateway: "paystack", reference: "ref_1", trxref: "ref_1" }) {
  signInAs("m1", ["admin"]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // StrictMode on purpose: it runs effects twice, which is exactly what the
  // reveal-once guard has to survive.
  return render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <PaymentCompletePage params={params} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

describe("PaymentCompletePage", () => {
  it("passes Paystack's query through, then reveals the PINs exactly once", async () => {
    const calls = serve(true);
    open();

    expect(await screen.findByText("4821930576")).toBeInTheDocument();
    expect(screen.getByText(/Payment confirmed: 1 card for 2026\/2027/)).toBeInTheDocument();
    expect(calls.confirm[0]).toContain("reference=ref_1");
    expect(calls.confirm[0]).toContain("gateway=paystack");
    // A second reveal would have returned [] and blanked the sheet.
    expect(calls.reveal).toBe(1);
  });

  it("never asks for PINs when the payment failed", async () => {
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

  it("explains an empty reveal instead of showing nothing", async () => {
    const calls = serve(true);
    calls.reveal = 1; // the PINs were already handed out
    open();
    expect(await screen.findByText(/already been shown once/)).toBeInTheDocument();
  });

  it("doesn't call the API without a payment reference", () => {
    const calls = serve(true);
    open({});
    expect(screen.getByText(/opens after paying for cards on Paystack/)).toBeInTheDocument();
    expect(calls.confirm).toEqual([]);
  });
});
