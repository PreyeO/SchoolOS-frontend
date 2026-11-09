// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { CardAssignment, ScratchCard } from "../types";
import { ReplaceCardDialog } from "./replace-card-dialog";

const { toastError } = vi.hoisted(() => ({ toastError: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: toastError } }));

const card = { id: "c1", serial: "OLDS-ERIA-L1", academic_session_name: "2026/2027", student: null } as ScratchCard;

const assignment = (channel: "sms" | "print") =>
  ({
    id: "a1", card: "c1", serial: "OLDS-ERIA-L1", intended_student: "s1", admission_number: "ADM/001",
    student_name: "Ada Obi", guardian_name: "Mrs Obi", phone: "+234803****678", channel, reason: "issued",
    superseded_at: null, message_status: channel === "sms" ? "delivered" : null, mismatch: false,
    assigned_at: "2026-10-26T09:00:00Z",
  }) as CardAssignment;

const batch = { id: "b1", channel: "print", scope: "selection", student_count: 1 };
const printed = {
  batch, created: true,
  pins: [{ student_id: "s1", admission_number: "ADM/001", student_name: "Ada Obi", serial: "NEWS-ERIA-L2", pin: "5550001111" }],
};

// rows: what GET card-assignments/?card=c1 returns. replies: one per POST, in order.
function serve(rows: CardAssignment[], ...replies: (() => Response)[]) {
  const bodies: Record<string, unknown>[] = [];
  server.use(
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.ASSIGNMENTS()), () =>
      HttpResponse.json({ count: rows.length, next: null, previous: null, results: rows }),
    ),
    http.post(apiUrl(SCRATCH_CARD_ENDPOINTS.REPLACE("c1")), async ({ request }) => {
      bodies.push((await request.json()) as Record<string, unknown>);
      return replies[bodies.length - 1]();
    }),
  );
  return bodies;
}

describe("ReplaceCardDialog", () => {
  it("explains a card nobody was issued is in stock, and offers no replace", async () => {
    serve([]);
    renderWithClient(<ReplaceCardDialog card={card} onClose={() => {}} />);
    expect(await screen.findByText(/It's in stock/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Replace and/ })).not.toBeInTheDocument();
  });

  it("ignores a superseded assignment: only the active one can be replaced", async () => {
    serve([{ ...assignment("print"), superseded_at: "2026-10-27T09:00:00Z" }]);
    renderWithClient(<ReplaceCardDialog card={card} onClose={() => {}} />);
    expect(await screen.findByText(/It's in stock/)).toBeInTheDocument();
  });

  it("prints: sends the choice and shows the new PIN once", async () => {
    const bodies = serve([assignment("print")], () => HttpResponse.json(printed, { status: 201 }));
    const { user } = renderWithClient(<ReplaceCardDialog card={card} onClose={() => {}} />);

    expect(await screen.findByText("Ada Obi")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Replace and show PIN" }));

    expect(await screen.findByText("5550001111")).toBeInTheDocument();
    expect(screen.getByText("NEWS-ERIA-L2")).toBeInTheDocument();
    expect(bodies[0]).toMatchObject({ reason: "lost", channel: "print" });
  });

  it("retries with the same idempotency key, so a lost response can't issue twice", async () => {
    const bodies = serve(
      [assignment("print")],
      () => HttpResponse.json({ detail: "Server error" }, { status: 500 }),
      () => HttpResponse.json(printed, { status: 201 }),
    );
    const { user } = renderWithClient(<ReplaceCardDialog card={card} onClose={() => {}} />);
    const submit = await screen.findByRole("button", { name: "Replace and show PIN" });

    await user.click(submit);
    await vi.waitFor(() => expect(toastError).toHaveBeenCalled());
    await user.click(submit);

    expect(await screen.findByText("5550001111")).toBeInTheDocument();
    expect(bodies[0].idempotency_key).toEqual(expect.any(String));
    expect(bodies[1].idempotency_key).toBe(bodies[0].idempotency_key);
  });

  it("texts: defaults to the original channel and says the PIN goes only to the phone", async () => {
    const bodies = serve([assignment("sms")], () =>
      HttpResponse.json({ batch: { ...batch, channel: "sms" }, pins: null, created: true }, { status: 201 }),
    );
    const { user } = renderWithClient(<ReplaceCardDialog card={card} onClose={() => {}} />);

    await user.click(await screen.findByRole("button", { name: "Replace and text" }));

    expect(await screen.findByText(/queued to the guardian's phone/)).toBeInTheDocument();
    expect(bodies[0]).toMatchObject({ reason: "never_arrived", channel: "sms" });
  });

  it("warns that switching a texted card to print doesn't refund the text", async () => {
    serve([assignment("sms")]);
    const { user } = renderWithClient(<ReplaceCardDialog card={card} onClose={() => {}} />);
    await user.click(await screen.findByRole("radio", { name: /Print a new slip/ }));
    expect(screen.getByText(/doesn.t refund the credits/)).toBeInTheDocument();
  });

  it("explains a 409 print replay instead of offering a retry that can't return the PIN", async () => {
    serve([assignment("print")], () =>
      HttpResponse.json({ detail: "This print issuance was already processed." }, { status: 409 }),
    );
    const { user } = renderWithClient(<ReplaceCardDialog card={card} onClose={() => {}} />);
    await user.click(await screen.findByRole("button", { name: "Replace and show PIN" }));
    expect(await screen.findByText(/already went through/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Replace and/ })).not.toBeInTheDocument();
  });
});
