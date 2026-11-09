// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WALLET_ENDPOINTS } from "@/lib/api/endpoints";
import { goToPayment } from "@/lib/go-to-payment";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { WalletSummary } from "../types";
import { TopUpForm } from "./top-up-form";

const { toastError } = vi.hoisted(() => ({ toastError: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: toastError } }));
vi.mock("@/lib/go-to-payment", () => ({ goToPayment: vi.fn() }));

const wallet: WalletSummary = { balance: 0, credit_price: 10, min_topup_credits: 10, max_topup_credits: 10000 };

function serve(reply = () => HttpResponse.json({ id: "t1", payment_link: "https://checkout.paystack.com/x" }, { status: 201 })) {
  const posts: unknown[] = [];
  server.use(
    http.post(apiUrl(WALLET_ENDPOINTS.TOPUPS()), async ({ request }) => {
      posts.push(await request.json());
      return reply();
    }),
  );
  return posts;
}

describe("TopUpForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("quotes naira from the live credit price, and presets fill the field", async () => {
    serve();
    const { user } = renderWithClient(<TopUpForm wallet={wallet} />);
    expect(screen.getByText("₦10 per credit")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "1,000" }));
    expect(screen.getByLabelText("Credits to buy")).toHaveValue(1000);
    expect(screen.getByText("₦10,000")).toBeInTheDocument();
  });

  it("sends credits and the gateway only, never an amount, then hands off to Paystack", async () => {
    const posts = serve();
    const { user } = renderWithClient(<TopUpForm wallet={wallet} />);
    await user.clear(screen.getByLabelText("Credits to buy"));
    await user.type(screen.getByLabelText("Credits to buy"), "250");
    await user.click(screen.getByRole("button", { name: "Continue to payment" }));

    await waitFor(() => expect(posts).toEqual([{ credits: 250, gateway: "paystack" }]));
    expect(goToPayment).toHaveBeenCalledWith("https://checkout.paystack.com/x");
  });

  it("holds the server's bounds before sending anything", async () => {
    const posts = serve();
    const { user } = renderWithClient(<TopUpForm wallet={{ ...wallet, max_topup_credits: 500 }} />);
    await user.clear(screen.getByLabelText("Credits to buy"));
    await user.type(screen.getByLabelText("Credits to buy"), "501");
    await user.click(screen.getByRole("button", { name: "Continue to payment" }));

    expect(await screen.findByText("At most 500 credits per top-up")).toBeInTheDocument();
    expect(posts).toEqual([]);
  });

  it("toasts the server's refusal as written (e.g. the ₦100 minimum charge)", async () => {
    serve(() => HttpResponse.json({ detail: "The smallest top-up charge is ₦100. Add more credits." }, { status: 400 }));
    const { user } = renderWithClient(<TopUpForm wallet={{ ...wallet, credit_price: 5 }} />);
    await user.click(screen.getByRole("button", { name: "Continue to payment" }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("The smallest top-up charge is ₦100. Add more credits."));
    expect(goToPayment).not.toHaveBeenCalled();
  });
});
