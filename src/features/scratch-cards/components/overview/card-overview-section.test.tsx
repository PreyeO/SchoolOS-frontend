// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import { CardOverviewSection } from "./card-overview-section";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const row = (id: string, name: string, extra = {}) =>
  ({ student_id: id, student_name: name, admission_number: `ADM/${id}`, guardian_name: "", phone_masked: null, contact_id: null, pages: 1, ...extra });

const PREVIEW = {
  eligible: [row("1", "Tobi Ade", { guardian_name: "Kemi Ade", phone_masked: "+234803***2210" })],
  no_number: [row("2", "Yusuf Garba")],
  invalid_number: [],
  already_has_card: [row("3", "Ada Obi"), row("4", "Musa Bello")],
  not_enrolled: [row("9", "Left Student")],
  not_found: [],
  stock_available: 1, stock_shortfall: 0, credits_required: 1, credit_shortfall: 0, estimated_pages: 1,
  estimated_cost_naira: 10, wallet_balance: 0, credit_price_naira: 10, can_commit: false,
};

function serve() {
  const previews: Record<string, unknown>[] = [];
  server.use(
    http.post(apiUrl(SCRATCH_CARD_ENDPOINTS.ISSUE_PREVIEW()), async ({ request }) => {
      previews.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json(PREVIEW);
    }),
    http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.CARDS()), () => HttpResponse.json({ count: 1, next: null, previous: null, results: [] })),
  );
  return previews;
}

describe("CardOverviewSection", () => {
  it("previews the whole school for the session, and counts enrolled students only", async () => {
    const previews = serve();
    renderWithClient(<CardOverviewSection sessionId="sess" onBuy={() => {}} />);

    expect(await screen.findByRole("heading", { name: /2 of 4 students/ })).toBeInTheDocument();
    expect(previews).toEqual([{ scope: "school", academic_session_id: "sess", channel: "sms" }]);
    expect(screen.getByRole("link", { name: "Send cards" })).toHaveAttribute(
      "href",
      "/scratch-cards/issue?scope=school&session=sess&check=1",
    );
    expect(screen.queryByText("Left Student")).not.toBeInTheDocument();
  });

  it("flags what blocks a send, with the fix next to it", async () => {
    serve();
    const onBuy = vi.fn();
    const { user } = renderWithClient(<CardOverviewSection sessionId="sess" onBuy={onBuy} />);
    const ready = await screen.findByRole("region", { name: "Ready to send?" });

    expect(within(ready).getByText("1 cards left, 2 needed")).toBeInTheDocument();
    expect(within(ready).getByText("1 student has no parent number")).toBeInTheDocument();
    expect(within(ready).getByText("0 SMS credits, 1 needed")).toBeInTheDocument();
    await user.click(within(ready).getByRole("button", { name: "Buy cards" }));
    expect(onBuy).toHaveBeenCalled();
  });

  it("lists students with the next step for each, starting on Waiting", async () => {
    serve();
    const { user } = renderWithClient(<CardOverviewSection sessionId="sess" onBuy={() => {}} />);
    const list = await screen.findByRole("region", { name: "Students" });

    const tobi = within(list).getByText("Tobi Ade").closest("li") as HTMLElement;
    expect(within(tobi).getByText(/Will be texted to Kemi Ade/)).toBeInTheDocument();
    expect(within(tobi).getByRole("link", { name: "Send card" }).getAttribute("href")).toContain("student=1");
    expect(within(list).queryByText("Ada Obi")).not.toBeInTheDocument(); // has a card: not in Waiting

    await user.click(within(list).getByRole("button", { name: /Have a card 2/ }));
    const ada = within(list).getByText("Ada Obi").closest("li") as HTMLElement;
    expect(within(ada).getByRole("link", { name: "Card details" })).toHaveAttribute("href", "/students/3");
  });

  it("'Add number' opens the form for that student", async () => {
    serve();
    const { user } = renderWithClient(<CardOverviewSection sessionId="sess" onBuy={() => {}} />);
    const list = await screen.findByRole("region", { name: "Students" });
    const yusuf = within(list).getByText("Yusuf Garba").closest("li") as HTMLElement;
    await user.click(within(yusuf).getByRole("button", { name: "Add number" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("For Yusuf Garba (ADM/2).");
  });

  it("shows the server's reason when the overview can't load (e.g. a school whose trial ended)", async () => {
    server.use(
      http.post(apiUrl(SCRATCH_CARD_ENDPOINTS.ISSUE_PREVIEW()), () =>
        HttpResponse.json({ detail: "Your school's trial period has ended." }, { status: 403 }),
      ),
      http.get(apiUrl(SCRATCH_CARD_ENDPOINTS.CARDS()), () => HttpResponse.json({ count: 0, next: null, previous: null, results: [] })),
    );
    renderWithClient(<CardOverviewSection sessionId="sess" onBuy={() => {}} />);
    expect(await screen.findByText(/Couldn.t load this session.s cards/)).toBeInTheDocument();
  });
});
