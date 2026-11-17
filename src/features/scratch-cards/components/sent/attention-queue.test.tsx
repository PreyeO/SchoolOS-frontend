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

// Empty body on purpose: it stays empty until the worker sends, which is when
// texts get stuck. The name must come from `student`.
const msg = (id: string, status: "unknown" | "failed", refunded = false) =>
  ({
    id, status, credits_refunded: refunded, credits_charged: 1, recipient_phone: "+234803***4567", body: "",
    student: { id: `s-${id}`, name: `Ada Obi ${id}`, admission_number: "ADM/001" }, failure_reason: "",
    created_at: "2026-11-09T09:00:00Z",
  }) as OutboundMessage;

// Like the real server since backend 1a0ab0b: a resent message becomes
// "resolved", so it no longer comes back in the unknown/failed lists.
function serve() {
  const resolves: Record<string, unknown>[] = [];
  const resolved = new Set<string>();
  server.use(
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.MESSAGES()), ({ request }) => {
      const status = new URL(request.url).searchParams.get("status");
      const all = status === "unknown" ? [msg("m1", "unknown")] : [msg("m2", "failed"), msg("m3", "failed", true)];
      const results = all.filter((m) => !resolved.has(m.id));
      return HttpResponse.json({ count: results.length, next: null, previous: null, results });
    }),
    http.post(apiUrl(SCRATCH_CARD_ENDPOINTS.RESOLVE()), async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      resolves.push(body);
      if (body.action === "resend") resolved.add(body.message_id as string);
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

  it("names the student from `student`, not the (empty) body", async () => {
    serve();
    renderWithClient(<AttentionQueue />);
    expect(await screen.findByText("Ada Obi m1")).toBeInTheDocument();
  });

  it("drops a resent text once the server has resolved it", async () => {
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
