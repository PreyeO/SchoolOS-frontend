// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { ScratchCard } from "../types";
import { CardsTable } from "./cards-table";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const card = (id: string, serial: string, revoked = false) =>
  ({
    id, serial, student: null, purchase: "p1", academic_session_name: "2026/2027",
    is_locked: false, is_revoked: revoked, revoked_at: null, regenerated_from: null,
    failed_attempts: 0, bound_at: null, last_used_at: null, created_at: "2026-10-18T09:00:00Z",
  }) as ScratchCard;

// A stock list that changes after a regenerate, as the real one does: the old
// card comes back revoked and the new one is added.
function serve() {
  let regenerated = false;
  server.use(
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.CARDS()), () => {
      const results = regenerated
        ? [card("c1", "OLDS-ERIA-L1", true), card("c2", "NEWS-ERIA-L2")]
        : [card("c1", "OLDS-ERIA-L1")];
      return HttpResponse.json({ count: results.length, next: null, previous: null, results });
    }),
    http.post(apiUrl(SCRATCH_CARD_ENDPOINTS.REGENERATE("c1")), () => {
      regenerated = true;
      return HttpResponse.json({ card: card("c2", "NEWS-ERIA-L2"), pin: "5550001111" });
    }),
  );
}

describe("CardsTable regenerate", () => {
  it("keeps the new PIN on screen after the list refreshes and the old card turns Replaced", async () => {
    serve();
    const { user } = renderWithClient(<CardsTable />);
    const row = (await screen.findByText("OLDS-ERIA-L1")).closest("tr") as HTMLElement;

    await user.click(within(row).getByRole("button", { name: /Regenerate/ }));
    await user.click(screen.getByRole("button", { name: "Issue new card" }));

    // The list refetch lands: the old card is now Replaced.
    expect(await screen.findByText("Replaced")).toBeInTheDocument();
    // Regression: the dialog lived in the old card's row and vanished with it.
    expect(within(screen.getByRole("dialog")).getByText("5550001111")).toBeInTheDocument();
  });
});
