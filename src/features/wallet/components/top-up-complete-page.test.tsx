// @vitest-environment jsdom
import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { WALLET_ENDPOINTS } from "@/lib/api/endpoints";
import { signInAs } from "@/test/fixtures";
import { apiUrl, server } from "@/test/msw/server";

import type { TopUpStatus } from "../types";
import { TopUpCompletePage } from "./top-up-complete-page";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// The server credits the wallet inside the confirm call, so the balance only
// moves once it has run: a summary read before that would be the old 20.
// Verifying with Paystack takes a moment, so the confirm is delayed: a summary
// fetched alongside it lands first and reads the pre-credit balance.
function serve(status: TopUpStatus) {
  const calls = { confirm: [] as { search: string; auth: string | null }[], balancesRead: [] as number[] };
  let balance = 20;
  server.use(
    http.get(apiUrl(WALLET_ENDPOINTS.TOPUP_RETURN()), async ({ request }) => {
      calls.confirm.push({ search: new URL(request.url).search, auth: request.headers.get("authorization") });
      await delay(50);
      if (status === "successful") balance = 70;
      return HttpResponse.json({ id: "t1", status, credits_purchased: 50, gateway_reference: "WTP-ABC" });
    }),
    http.get(apiUrl(WALLET_ENDPOINTS.SUMMARY()), () => {
      calls.balancesRead.push(balance);
      return HttpResponse.json({ balance, credit_price: 10, min_topup_credits: 10, max_topup_credits: 10000 });
    }),
  );
  return calls;
}

function open(params: Record<string, string> = { gateway: "paystack", reference: "WTP-ABC", trxref: "WTP-ABC" }) {
  signInAs("m1", ["admin"]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <TopUpCompletePage params={params} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

describe("TopUpCompletePage", () => {
  it("confirms once, then shows the balance read after the credit", async () => {
    const calls = serve("successful");
    open();

    expect(await screen.findByText(/50 credits added\. Your balance is now 70 credits\./)).toBeInTheDocument();
    expect(calls.confirm).toHaveLength(1);
    expect(calls.confirm[0].search).toContain("reference=WTP-ABC");
    // The balance is only read once the credit has landed, never before.
    expect(calls.balancesRead).toEqual([70]);
  });

  it("sends no token: the return route is public, and a stale one would 401 it", async () => {
    const calls = serve("successful");
    open();
    await screen.findByText(/50 credits added/);
    expect(calls.confirm[0].auth).toBeNull();
  });

  it("says nothing was added when the payment failed, with the reference for support", async () => {
    serve("failed");
    open();
    expect(await screen.findByText(/no credits were added/)).toBeInTheDocument();
    expect(screen.getByText("WTP-ABC")).toBeInTheDocument();
  });

  it("waits on a pending payment and checks again on request", async () => {
    const calls = serve("pending");
    open();
    await userEvent.click(await screen.findByRole("button", { name: "Check again" }));
    expect(calls.confirm.length).toBeGreaterThanOrEqual(2);
  });

  it("doesn't call the API without a payment reference", () => {
    const calls = serve("successful");
    open({});
    expect(screen.getByText(/opens after paying for SMS credits/)).toBeInTheDocument();
    expect(calls.confirm).toEqual([]);
  });
});
