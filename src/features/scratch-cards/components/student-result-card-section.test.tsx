// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { GUARDIAN_CONTACT_ENDPOINTS, SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { CardAssignment } from "../types";
import { StudentResultCardSection } from "./student-result-card-section";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const page = <T,>(results: T[]) => ({ count: results.length, next: null, previous: null, results });
const row = (over: Partial<CardAssignment>) =>
  ({
    id: "a", serial: "AAAA-BBBB-CC", channel: "sms", reason: "issued", guardian_name: "Mrs Obi", phone: "+234803***4567",
    superseded_at: null, message_status: "delivered", mismatch: false, assigned_at: "2026-11-01T09:00:00Z", ...over,
  }) as CardAssignment;

const parentAccount = { student_id: "s1", admission_number: "ADM/001", student_name: "Ada Obi", name: "Ngozi Obi", phone: "+2348031112222" };

// account_phone sits next to results (not in a row), as the backend sends it
// with ?student=.
function serve(history: CardAssignment[], accountPhone: typeof parentAccount | null = null) {
  const queries: Record<string, string | null> = {};
  server.use(
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.ASSIGNMENTS()), ({ request }) => {
      queries.intended_student = new URL(request.url).searchParams.get("intended_student");
      return HttpResponse.json(page(history));
    }),
    http.get(apiUrl(GUARDIAN_CONTACT_ENDPOINTS.LIST()), ({ request }) => {
      queries.student = new URL(request.url).searchParams.get("student");
      return HttpResponse.json({ ...page([]), account_phone: accountPhone });
    }),
  );
  return queries;
}

const student = { id: "s1", name: "Ada Obi", admission_number: "ADM/001" };

describe("StudentResultCardSection", () => {
  it("asks for this student's numbers and cards only", async () => {
    const queries = serve([]);
    renderWithClient(<StudentResultCardSection student={student} />);
    expect(await screen.findByText(/No result card has been issued/)).toBeInTheDocument();
    expect(queries).toEqual({ intended_student: "s1", student: "s1" });
  });

  it("with no saved number, shows the parent-account number the text will go to, read-only", async () => {
    serve([], parentAccount);
    renderWithClient(<StudentResultCardSection student={student} />);
    expect(await screen.findByText(/texted to their parent.s account phone/)).toBeInTheDocument();
    expect(screen.getByText("Ngozi Obi")).toBeInTheDocument();
    expect(screen.getByText("0803 111 2222")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Edit|Remove/ })).not.toBeInTheDocument();
  });

  it("says plainly when there's no number anywhere", async () => {
    serve([], null);
    renderWithClient(<StudentResultCardSection student={student} />);
    expect(await screen.findByText(/no linked parent account has a phone/)).toBeInTheDocument();
  });

  it("shows the reissue chain: current card on top, the replaced one marked, and a mismatch", async () => {
    serve([
      row({ id: "a2", serial: "NEWS-ERIA-L2", reason: "lost", channel: "print", message_status: null, mismatch: true }),
      row({ id: "a1", serial: "OLDS-ERIA-L1", superseded_at: "2026-11-05T09:00:00Z" }),
    ]);
    renderWithClient(<StudentResultCardSection student={student} />);

    const items = await screen.findAllByRole("listitem");
    const [current, old] = items.filter((li) => /ERIA/.test(li.textContent ?? ""));
    expect(within(current).getByText("Current")).toBeInTheDocument();
    expect(within(current).getByText("Replacement: card lost")).toBeInTheDocument();
    expect(within(current).getByText(/Printed slip/)).toBeInTheDocument();
    expect(within(current).getByText(/different student/)).toBeInTheDocument();
    expect(within(old).getByText("Replaced")).toBeInTheDocument();
    expect(within(old).getByText(/Replaced on .*this serial no longer works/)).toBeInTheDocument();
    // Replace is offered on the current card only.
    expect(within(current).getByRole("button", { name: /Replace/ })).toBeInTheDocument();
    expect(within(old).queryByRole("button", { name: /Replace/ })).not.toBeInTheDocument();
    expect(within(old).getByText("Delivered")).toBeInTheDocument();
  });
});
