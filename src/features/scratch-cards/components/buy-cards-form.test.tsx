// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ACADEMIC_SESSION_ENDPOINTS, SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import { signInAs } from "@/test/fixtures";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import { goToPayment } from "@/lib/go-to-payment";

import { BuyCardsForm } from "./buy-cards-form";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/go-to-payment", () => ({ goToPayment: vi.fn() }));

const sessions = [
  { id: "s-old", name: "2025/2026", periods: [], created_at: "2025-09-01T00:00:00Z" },
  { id: "s-new", name: "2026/2027", periods: [], created_at: "2026-09-01T00:00:00Z" },
];

function serve() {
  const posts: unknown[] = [];
  server.use(
    http.get(apiUrl(ACADEMIC_SESSION_ENDPOINTS.LIST()), () =>
      HttpResponse.json({ count: 2, next: null, previous: null, results: sessions }),
    ),
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.PRICE()), () => HttpResponse.json({ unit_price: 1000 })),
    http.post(apiUrl(SCRATCH_CARD_ENDPOINTS.PURCHASES()), async ({ request }) => {
      posts.push(await request.json());
      return HttpResponse.json({ id: "p1", payment_link: "https://checkout.paystack.com/abc" }, { status: 201 });
    }),
  );
  return posts;
}

describe("BuyCardsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAs("m1", ["admin"]);
  });

  it("quotes the total from the live price as the quantity changes", async () => {
    serve();
    const { user } = renderWithClient(<BuyCardsForm />);
    expect(await screen.findByText("₦1,000 per card")).toBeInTheDocument();

    const quantity = screen.getByLabelText("Number of cards");
    await user.clear(quantity);
    await user.type(quantity, "250");
    expect(screen.getByText("₦250,000")).toBeInTheDocument();
  });

  it("starts a Paystack purchase without sending a price, then hands off to checkout", async () => {
    const posts = serve();
    const { user } = renderWithClient(<BuyCardsForm />);
    await screen.findByText("₦1,000 per card");

    await user.selectOptions(screen.getByLabelText("Session"), "s-new");
    await user.clear(screen.getByLabelText("Number of cards"));
    await user.type(screen.getByLabelText("Number of cards"), "40");
    await user.click(screen.getByRole("button", { name: "Continue to payment" }));

    await waitFor(() => expect(posts).toEqual([{ academic_session_id: "s-new", quantity: 40, gateway: "paystack" }]));
    expect(goToPayment).toHaveBeenCalledWith("https://checkout.paystack.com/abc");
  });

  it("refuses more than 1,000 cards before reaching the server", async () => {
    const posts = serve();
    const { user } = renderWithClient(<BuyCardsForm />);
    await screen.findByText("₦1,000 per card");

    await user.clear(screen.getByLabelText("Number of cards"));
    await user.type(screen.getByLabelText("Number of cards"), "1001");
    await user.click(screen.getByRole("button", { name: "Continue to payment" }));

    expect(await screen.findByText("At most 1,000 cards per purchase")).toBeInTheDocument();
    expect(posts).toEqual([]);
  });
});
