// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import { RecordsPage } from "./records-page";
import { ReplaceFromHistory } from "./replace-from-history";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("ReplaceFromHistory", () => {
  it("loads the card only when clicked, then opens the replace dialog for it", async () => {
    let cardLoads = 0;
    server.use(
      http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.CARD("c1")), () => {
        cardLoads += 1;
        return HttpResponse.json({ id: "c1", serial: "ABCD-EFGH-IJ", academic_session_name: "2026/2027", student: null, active_assignment: true });
      }),
      http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.ASSIGNMENTS()), () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
      ),
    );
    const { user } = renderWithClient(<ReplaceFromHistory cardId="c1" />);
    expect(cardLoads).toBe(0);

    await user.click(screen.getByRole("button", { name: /Replace/ }));
    expect(await screen.findByRole("dialog")).toHaveTextContent("Replace card ABCD-EFGH-IJ");
    expect(cardLoads).toBe(1);
  });
});

describe("RecordsPage", () => {
  it("opens on the tab it's linked to", () => {
    server.use(
      http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.PURCHASES()), () => HttpResponse.json({ count: 0, next: null, previous: null, results: [] })),
    );
    renderWithClient(<RecordsPage tab="purchases" />);
    expect(screen.getByRole("tab", { name: "Purchases" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("link", { name: "← Result cards" })).toHaveAttribute("href", "/scratch-cards");
  });
});
