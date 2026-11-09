// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { WALLET_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import { TopUpsList } from "./top-ups-list";
import { TransactionsList } from "./transactions-list";

const { toastSuccess } = vi.hoisted(() => ({ toastSuccess: vi.fn() }));
vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { success: toastSuccess, error: vi.fn() }) }));

const page = <T,>(results: T[]) => ({ count: results.length, next: null, previous: null, results });

describe("TransactionsList", () => {
  it("filters by type on the server, not by splitting one page", async () => {
    const types: (string | null)[] = [];
    server.use(
      http.get(apiUrl(WALLET_ENDPOINTS.TRANSACTIONS()), ({ request }) => {
        types.push(new URL(request.url).searchParams.get("type"));
        return HttpResponse.json(
          page([{ id: "x1", type: "debit", credits: -12, balance_after: 108, reference: "debit:issuance:b1",
            note: "", created_by: null, created_at: "2026-11-01T09:00:00Z" }]),
        );
      }),
    );
    const { user } = renderWithClient(<TransactionsList />);

    expect(await screen.findByText("Result card PINs texted")).toBeInTheDocument();
    expect(screen.getByText("−12")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Show activity"), "Texts sent");
    await vi.waitFor(() => expect(types.at(-1)).toBe("debit"));
    expect(types[0]).toBeNull();
  });
});

describe("TopUpsList", () => {
  it("re-checks a pending top-up with Paystack by its reference, and only offers it on pending rows", async () => {
    const checked: string[] = [];
    server.use(
      http.get(apiUrl(WALLET_ENDPOINTS.TOPUPS()), () =>
        HttpResponse.json(
          page([
            { id: "t1", status: "pending", credits_purchased: 50, amount: 500, gateway_reference: "WTP-P",
              initiated_by: null, created_at: "2026-11-01T09:00:00Z" },
            { id: "t2", status: "successful", credits_purchased: 100, amount: 1000, gateway_reference: "WTP-S",
              initiated_by: null, created_at: "2026-10-01T09:00:00Z" },
          ]),
        ),
      ),
      http.get(apiUrl(WALLET_ENDPOINTS.TOPUP_RETURN()), ({ request }) => {
        checked.push(new URL(request.url).searchParams.get("reference") ?? "");
        return HttpResponse.json({ id: "t1", status: "successful", credits_purchased: 50 });
      }),
    );
    const { user } = renderWithClient(<TopUpsList />);

    const buttons = await screen.findAllByRole("button", { name: "Check with Paystack" });
    expect(buttons).toHaveLength(1);
    await user.click(buttons[0]);
    await vi.waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("50 credits added."));
    expect(checked).toEqual(["WTP-P"]);
  });
});
