// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
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

describe("TopUpsList filters", () => {
  it("sends status and the date range to the server", async () => {
    const seen: URLSearchParams[] = [];
    server.use(
      http.get(apiUrl(WALLET_ENDPOINTS.TOPUPS()), ({ request }) => {
        seen.push(new URL(request.url).searchParams);
        return HttpResponse.json(page([]));
      }),
    );
    const { user } = renderWithClient(<TopUpsList />);
    await user.selectOptions(await screen.findByLabelText("Top-up status"), "Not paid");
    await user.type(screen.getByLabelText("To"), "2026-11-01");
    await vi.waitFor(() => {
      expect(seen.at(-1)?.get("status")).toBe("failed");
      expect(seen.at(-1)?.get("created_at_before")).toBe("2026-11-01");
    });
    expect(screen.getByText("No top-ups match these filters.")).toBeInTheDocument();
  });
});

describe("TopUpsList", () => {
  it("re-checks an uncredited top-up by its reference; never offered once credits were added", async () => {
    const checked: string[] = [];
    server.use(
      http.get(apiUrl(WALLET_ENDPOINTS.TOPUPS()), () =>
        HttpResponse.json(
          page([
            { id: "t1", status: "pending", credits_purchased: 50, amount: 500, gateway_reference: "WTP-P",
              initiated_by: null, created_at: "2026-11-01T09:00:00Z" },
            { id: "t2", status: "successful", credits_purchased: 100, amount: 1000, gateway_reference: "WTP-S",
              initiated_by: null, created_at: "2026-10-01T09:00:00Z" },
            // Unpaid, as Paystack's verify reports it: re-checkable, labelled "Not paid".
            { id: "t3", status: "failed", credits_purchased: 20, amount: 200, gateway_reference: "WTP-F",
              initiated_by: null, created_at: "2026-09-01T09:00:00Z" },
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
    expect(buttons).toHaveLength(2);
    // Scoped to the list: the status filter has a "Not paid" option too.
    expect(within(screen.getByRole("list")).getByText("Not paid")).toBeInTheDocument();
    await user.click(buttons[0]);
    await vi.waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("50 credits added."));
    expect(checked).toEqual(["WTP-P"]);
  });
});
