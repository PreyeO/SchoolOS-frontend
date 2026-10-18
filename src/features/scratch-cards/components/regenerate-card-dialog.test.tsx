// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import { student } from "@/test/fixtures";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { ScratchCard } from "../types";
import { RegenerateCardDialog } from "./regenerate-card-dialog";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const card = (bound: boolean) =>
  ({ id: "c1", serial: "OLDS-ERIA-L1", academic_session_name: "2026/2027", student: bound ? student("s1") : null }) as ScratchCard;

function serve() {
  const calls = { regenerate: 0 };
  server.use(
    http.post(apiUrl(SCRATCH_CARD_ENDPOINTS.REGENERATE("c1")), () => {
      calls.regenerate += 1;
      return HttpResponse.json({ card: { ...card(false), id: "c2", serial: "NEWS-ERIA-L2" }, pin: "5550001111" });
    }),
  );
  return calls;
}

describe("RegenerateCardDialog", () => {
  it("warns that the old card dies, and that a used card stays with its student", async () => {
    serve();
    const { user } = renderWithClient(<RegenerateCardDialog card={card(true)} />);
    await user.click(screen.getByRole("button", { name: /Regenerate/ }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("stop working immediately");
    expect(dialog).toHaveTextContent("The new card stays with s1 Test.");
  });

  it("shows the new serial and PIN once, and forgets them when closed", async () => {
    const calls = serve();
    const { user } = renderWithClient(<RegenerateCardDialog card={card(false)} />);
    await user.click(screen.getByRole("button", { name: /Regenerate/ }));
    await user.click(screen.getByRole("button", { name: "Issue new card" }));

    expect(await screen.findByText("5550001111")).toBeInTheDocument();
    expect(screen.getByText("NEWS-ERIA-L2")).toBeInTheDocument();
    expect(calls.regenerate).toBe(1);

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Regenerate/ }));
    expect(screen.queryByText("5550001111")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Issue new card" })).toBeInTheDocument();
  });
});
