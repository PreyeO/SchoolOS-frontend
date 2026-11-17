// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ACADEMIC_SESSION_ENDPOINTS, CLASS_ENDPOINTS, SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import { signInAs } from "@/test/fixtures";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { IssuancePreview } from "../../types";
import { IssueCardsPage } from "./issue-cards-page";

const { toastError } = vi.hoisted(() => ({ toastError: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: toastError } }));

const page = <T,>(results: T[]) => ({ count: results.length, next: null, previous: null, results });
const eligible = { student_id: "s1", admission_number: "ADM/001", student_name: "Ada Obi", guardian_name: "Mrs Obi", phone_masked: "+234803***4567", contact_id: "g1", pages: 1 };
const PREVIEW: IssuancePreview = {
  eligible: [eligible], no_number: [], invalid_number: [], already_has_card: [], not_enrolled: [], not_found: [],
  stock_available: 5, stock_shortfall: 0, credits_required: 1, credit_shortfall: 0, estimated_pages: 1,
  estimated_cost_naira: 10, wallet_balance: 20, credit_price_naira: 10, can_commit: true,
};

type Body = Record<string, unknown>;
function serve(commitReplies: (() => Response)[]) {
  const calls = { preview: [] as Body[], commit: [] as Body[] };
  server.use(
    http.get(apiUrl(ACADEMIC_SESSION_ENDPOINTS.LIST()), () => HttpResponse.json(page([{ id: "sess", name: "2026/2027", periods: [] }]))),
    http.get(apiUrl(CLASS_ENDPOINTS.LIST()), () => HttpResponse.json(page([{ id: "k1", name: "JSS1", level: "junior_secondary", order: 1, arms: [] }]))),
    http.post(apiUrl(SCRATCH_CARD_ENDPOINTS.ISSUE_PREVIEW()), async ({ request }) => {
      calls.preview.push((await request.json()) as Body);
      return HttpResponse.json(PREVIEW);
    }),
    http.post(apiUrl(SCRATCH_CARD_ENDPOINTS.ISSUE_COMMIT()), async ({ request }) => {
      calls.commit.push((await request.json()) as Body);
      return commitReplies[calls.commit.length - 1]();
    }),
  );
  return calls;
}

const texted = () => HttpResponse.json({ batch: { id: "b1", student_count: 1, channel: "sms" }, pins: null, created: true }, { status: 201 });

async function checkClass(user: ReturnType<typeof renderWithClient>["user"]) {
  await user.selectOptions(await screen.findByLabelText("Class"), "k1");
  await user.click(screen.getByRole("button", { name: "Check who gets a card" }));
  await screen.findByText("1 will get a card");
}

describe("IssueCardsPage", () => {
  beforeEach(() => { vi.clearAllMocks(); signInAs("m1", ["admin"]); });

  it("can't check until a class is chosen, then previews exactly that class", async () => {
    const calls = serve([texted]);
    const { user } = renderWithClient(<IssueCardsPage />);
    expect(await screen.findByRole("button", { name: "Check who gets a card" })).toBeDisabled();
    await checkClass(user);
    expect(calls.preview).toEqual([{ scope: "class", class_id: "k1", academic_session_id: "sess", channel: "sms" }]);
  });

  it("commits the previewed send with a key, and retries with the SAME key", async () => {
    const calls = serve([() => HttpResponse.json({ detail: "boom" }, { status: 500 }), texted]);
    const { user } = renderWithClient(<IssueCardsPage />);
    await checkClass(user);

    const send = screen.getByRole("button", { name: "Text 1 parents (1 credits)" });
    await user.click(send);
    await waitFor(() => expect(toastError).toHaveBeenCalled());
    await user.click(send);

    expect(await screen.findByText(/1 text queued/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Watch delivery" })).toHaveAttribute("href", "/scratch-cards/batches/b1");
    expect(calls.commit[0]).toMatchObject({ scope: "class", class_id: "k1", channel: "sms" });
    expect(calls.commit[1].idempotency_key).toBe(calls.commit[0].idempotency_key);
  });

  it("uses a new key once the request changes (here: SMS → print)", async () => {
    const calls = serve([() => HttpResponse.json({ detail: "boom" }, { status: 500 }), () =>
      HttpResponse.json({ batch: { id: "b2" }, created: true, pins: [{ student_id: "s1", admission_number: "ADM/001", student_name: "Ada Obi", serial: "NEWS-ERIA-L2", pin: "5550001111" }] }, { status: 201 })]);
    const { user } = renderWithClient(<IssueCardsPage />);
    await checkClass(user);
    await user.click(screen.getByRole("button", { name: /Text 1 parents/ }));
    await waitFor(() => expect(toastError).toHaveBeenCalled());

    await user.click(screen.getByRole("radio", { name: /Print named slips/ }));
    await user.click(screen.getByRole("button", { name: "Check who gets a card" }));
    await user.click(await screen.findByRole("button", { name: "Issue 1 cards and show PINs" }));

    // The printed result names the student, and the PIN is shown.
    expect(await screen.findByText("5550001111")).toBeInTheDocument();
    expect(screen.getByText("Ada Obi")).toBeInTheDocument();
    expect(calls.commit[1].idempotency_key).not.toBe(calls.commit[0].idempotency_key);
  });

  it("explains a 409 replay instead of offering a retry that can't return the PINs", async () => {
    serve([() => HttpResponse.json({ detail: "This print issuance was already processed." }, { status: 409 })]);
    const { user } = renderWithClient(<IssueCardsPage />);
    await checkClass(user);
    await user.click(screen.getByRole("button", { name: /Text 1 parents/ }));
    expect(await screen.findByText(/were already issued, but the PINs were in a response/)).toBeInTheDocument();
  });

  // The overview's links: pre-filled, checked once automatically, never sent.
  it("pre-filled for the whole school, checks once by itself and sends nothing", async () => {
    const calls = serve([texted]);
    renderWithClient(<IssueCardsPage prefill={{ scope: "school", sessionId: "sess", check: true }} />);

    expect(await screen.findByText("1 will get a card")).toBeInTheDocument();
    expect(calls.preview).toEqual([{ scope: "school", academic_session_id: "sess", channel: "sms" }]);
    expect(calls.commit).toEqual([]);
  });

  it("pre-filled for one student, checks just that student", async () => {
    const calls = serve([texted]);
    renderWithClient(
      <IssueCardsPage prefill={{ scope: "selection", sessionId: "sess", student: { id: "s1", name: "Ada Obi", admission_number: "ADM/001" }, check: true }} />,
    );
    await screen.findByText("1 will get a card");
    expect(calls.preview).toEqual([{ scope: "selection", student_ids: ["s1"], academic_session_id: "sess", channel: "sms" }]);
    expect(screen.getByRole("list", { name: "Chosen students" })).toHaveTextContent("Ada Obi");
  });

  it("drops a stale preview when the form changes", async () => {
    serve([texted]);
    const { user } = renderWithClient(<IssueCardsPage />);
    await checkClass(user);
    await user.selectOptions(screen.getByLabelText("Who gets a card"), "school");
    expect(screen.queryByText("1 will get a card")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Text 1 parents/ })).not.toBeInTheDocument();
  });
});
