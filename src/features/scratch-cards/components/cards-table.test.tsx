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

// A stock list that changes after a print replace, as the real one does: the
// old card comes back revoked and the new one is added.
function serve() {
  let replaced = false;
  const cardQueries: URLSearchParams[] = [];
  server.use(
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.CARDS()), ({ request }) => {
      cardQueries.push(new URL(request.url).searchParams);
      const results = replaced
        ? [card("c1", "OLDS-ERIA-L1", true), card("c2", "NEWS-ERIA-L2")]
        : [card("c1", "OLDS-ERIA-L1")];
      return HttpResponse.json({ count: results.length, next: null, previous: null, results });
    }),
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.ASSIGNMENTS()), () => {
      const results = replaced
        ? []
        : [{ id: "a1", card: "c1", student_name: "Ada Obi", admission_number: "ADM/001", channel: "print",
            guardian_name: "", phone: "", superseded_at: null, assigned_at: "2026-10-26T09:00:00Z" }];
      return HttpResponse.json({ count: results.length, next: null, previous: null, results });
    }),
    http.post(apiUrl(SCRATCH_CARD_ENDPOINTS.REPLACE("c1")), () => {
      replaced = true;
      return HttpResponse.json(
        { batch: { id: "b1" }, created: true, pins: [{ serial: "NEWS-ERIA-L2", pin: "5550001111" }] },
        { status: 201 },
      );
    }),
  );
  return cardQueries;
}

describe("CardsTable replace", () => {
  it("keeps the new PIN on screen after the list refreshes and the old card turns Replaced", async () => {
    serve();
    const { user } = renderWithClient(<CardsTable />);
    // jsdom applies no CSS, so the phone list and the table both render; act
    // on the table's row.
    const table = await screen.findByRole("table");
    const row = (await within(table).findByText("OLDS-ERIA-L1")).closest("tr") as HTMLElement;

    await user.click(within(row).getByRole("button", { name: /Replace/ }));
    await user.click(await screen.findByRole("button", { name: "Replace and show PIN" }));

    // The list refetch lands: the old card is now Replaced. (hidden: the open
    // dialog marks the page behind it aria-hidden.)
    expect(await within(screen.getByRole("table", { hidden: true })).findByText("Replaced")).toBeInTheDocument();
    // Regression: the dialog lived in the old card's row and vanished with it.
    // The assignment refetch (now empty) mustn't swap the PIN for "nothing to replace" either.
    expect(within(screen.getByRole("dialog")).getByText("5550001111")).toBeInTheDocument();
  });

  it("gives phones a compact list with the student, or that the card is unused", async () => {
    serve();
    renderWithClient(<CardsTable />);
    const list = await screen.findByRole("list");
    expect(within(list).getByText("OLDS-ERIA-L1")).toBeInTheDocument();
    expect(within(list).getByText("No student yet")).toBeInTheDocument();
    expect(within(list).getByText("Not used yet")).toBeInTheDocument();
    expect(within(list).getByRole("button", { name: /Replace/ })).toBeInTheDocument();
  });

  it("asks the server for stock with its own unused filter, not is_bound", async () => {
    const queries = serve();
    const { user } = renderWithClient(<CardsTable />);
    await screen.findByRole("table");
    await user.selectOptions(screen.getByLabelText("Show cards"), "In stock");
    await vi.waitFor(() => expect(queries.at(-1)?.get("unused")).toBe("true"));
    expect(queries.at(-1)?.has("is_bound")).toBe(false);
  });
});
