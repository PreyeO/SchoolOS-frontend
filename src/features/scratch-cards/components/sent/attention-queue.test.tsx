// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { OutboundMessage } from "../../types";
import { AttentionQueue } from "./attention-queue";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const msg = (id: string, status: "unknown" | "failed", refunded = false) =>
  ({
    id, status, credits_refunded: refunded, credits_charged: 1, recipient_phone: "+234803***4567",
    body: `Graceland: result card for Ada Obi ${id}. Serial ABCD PIN **********`, failure_reason: "", created_at: "2026-11-09T09:00:00Z",
  }) as OutboundMessage;

function serve() {
  const resolves: Record<string, unknown>[] = [];
  server.use(
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.MESSAGES()), ({ request }) => {
      const status = new URL(request.url).searchParams.get("status");
      const results = status === "unknown" ? [msg("m1", "unknown")] : [msg("m2", "failed"), msg("m3", "failed", true)];
      return HttpResponse.json({ count: results.length, next: null, previous: null, results });
    }),
    http.post(apiUrl(SCRATCH_CARD_ENDPOINTS.RESOLVE()), async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      resolves.push(body);
      return HttpResponse.json(
        body.action === "resend"
          ? { message_status: "pending", credits_refunded: false, batch: { id: "b9" } }
          : { message_status: "failed", credits_refunded: true },
      );
    }),
  );
  return resolves;
}

describe("AttentionQueue", () => {
  it("lists not-confirmed and unrefunded failed texts, not ones already refunded", async () => {
    serve();
    renderWithClient(<AttentionQueue />);
    expect(await screen.findByText("2 texts need a decision")).toBeInTheDocument();
    expect(screen.getByText(/Ada Obi m1/)).toBeInTheDocument();
    expect(screen.getByText(/Ada Obi m2/)).toBeInTheDocument();
    expect(screen.queryByText(/Ada Obi m3/)).not.toBeInTheDocument();
  });

  // The server leaves the original message unknown after a resend; a second
  // click would be a second paid text.
  it("removes a resent text from the queue so it can't be resent twice", async () => {
    const resolves = serve();
    const { user } = renderWithClient(<AttentionQueue />);
    const [first] = await screen.findAllByRole("button", { name: /Send again/ });
    await user.click(first);

    await vi.waitFor(() => expect(screen.queryByText(/Ada Obi m1/)).not.toBeInTheDocument());
    expect(resolves).toEqual([{ message_id: "m1", action: "resend", idempotency_key: expect.any(String) }]);
  });

  it("refunds with mark_failed", async () => {
    const resolves = serve();
    const { user } = renderWithClient(<AttentionQueue />);
    const [first] = await screen.findAllByRole("button", { name: "Mark failed and refund" });
    await user.click(first);
    await vi.waitFor(() => expect(resolves[0]).toMatchObject({ message_id: "m1", action: "mark_failed" }));
  });
});
