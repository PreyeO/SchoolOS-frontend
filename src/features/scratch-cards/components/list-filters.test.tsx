// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ACADEMIC_SESSION_ENDPOINTS, SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import { signInAs } from "@/test/fixtures";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import { CardsTable } from "./cards-table";
import { PurchasesTable } from "./purchases-table";
import { BatchesList } from "./sent/batches-list";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const page = <T,>(results: T[]) => ({ count: results.length, next: null, previous: null, results });

// Records every query string a list sends. Two sessions; neither is "current"
// in the store, so the filter starts on the first (newest) one.
function serve(endpoint: string, results: unknown[] = []) {
  const seen: URLSearchParams[] = [];
  server.use(
    http.get(apiUrl(ACADEMIC_SESSION_ENDPOINTS.LIST()), () =>
      HttpResponse.json(page([{ id: "s27", name: "2026/2027", periods: [] }, { id: "s26", name: "2025/2026", periods: [] }])),
    ),
    http.get(apiUrl(endpoint), ({ request }) => {
      seen.push(new URL(request.url).searchParams);
      return HttpResponse.json(page(results));
    }),
  );
  return seen;
}

describe("list filters are sent to the server", () => {
  beforeEach(() => signInAs("m1", ["admin"]));

  it("card stock: In stock is unused=true scoped to the session", async () => {
    const seen = serve(SCRATCH_CARD_ENDPOINTS.CARDS());
    const { user } = renderWithClient(<CardsTable />);
    await user.selectOptions(await screen.findByLabelText("Show cards"), "In stock");
    await vi.waitFor(() => {
      const last = seen.at(-1);
      expect(last?.get("unused")).toBe("true");
      expect(last?.get("academic_session_id")).toBe("s27");
    });
  });

  it("purchases: status, session and dates", async () => {
    const seen = serve(SCRATCH_CARD_ENDPOINTS.PURCHASES());
    const { user } = renderWithClient(<PurchasesTable />);
    await user.selectOptions(await screen.findByLabelText("Payment status"), "Paid");
    await user.type(screen.getByLabelText("From"), "2026-10-01");
    await vi.waitFor(() => {
      const last = seen.at(-1);
      expect(last?.get("status")).toBe("successful");
      expect(last?.get("academic_session_id")).toBe("s27");
      expect(last?.get("created_at_after")).toBe("2026-10-01");
      expect(last?.has("gateway")).toBe(false);
    });
  });

  it("purchases: shows card_count when replacements pushed it past quantity", async () => {
    serve(SCRATCH_CARD_ENDPOINTS.PURCHASES(), [
      { id: "p1", quantity: 40, card_count: 43, amount: 40000, status: "successful", academic_session_name: "2026/2027", initiated_by: null, pins_revealed_at: null, created_at: "2026-11-01T09:00:00Z" },
    ]);
    renderWithClient(<PurchasesTable />);
    expect(await screen.findByText(/43 incl\. replacements/)).toBeInTheDocument();
  });

  // The batch list's filter is `academic_session`, unlike the others' `_id`.
  it("sent: channel and academic_session (not academic_session_id)", async () => {
    const seen = serve(SCRATCH_CARD_ENDPOINTS.BATCHES());
    const { user } = renderWithClient(<BatchesList />);
    await user.selectOptions(await screen.findByLabelText("Texted or printed"), "Printed");
    await vi.waitFor(() => {
      const last = seen.at(-1);
      expect(last?.get("channel")).toBe("print");
      expect(last?.get("academic_session")).toBe("s27");
      expect(last?.has("academic_session_id")).toBe(false);
    });
  });

  it("an 'All sessions' choice drops the session param", async () => {
    const seen = serve(SCRATCH_CARD_ENDPOINTS.BATCHES());
    const { user } = renderWithClient(<BatchesList />);
    await screen.findByText(/No sends match/);
    await user.selectOptions(screen.getByLabelText("Session"), "All sessions");
    await vi.waitFor(() => expect(seen.at(-1)?.has("academic_session")).toBe(false));
  });
});
