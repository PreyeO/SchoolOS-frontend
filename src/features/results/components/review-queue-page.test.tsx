// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RESULT_SUBMISSION_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { ResultSubmission, SubmissionStatus } from "../types";
import { ReviewQueuePage } from "./review-queue-page";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/school/use-term-selection", () => ({
  useTermSelection: () => ({
    groups: [],
    periodId: "term-1",
    setPeriodId: vi.fn(),
    label: "First Term",
    isViewingCurrentTerm: true,
    hasTerms: true,
    isPending: false,
    isPaused: false,
  }),
}));
vi.mock("@/features/settings/hooks/use-classes", () => ({ useClasses: () => ({ data: [] }) }));
vi.mock("../hooks/use-review-queue-subjects", () => ({
  useReviewQueueSubjects: () => ({ subjects: [], isPending: false }),
}));

const name = (i: number) => `Subject ${String(i).padStart(2, "0")}`;

function makeTerm(total: number, awaiting: number[]): ResultSubmission[] {
  return Array.from({ length: total }, (_, i) => ({
    id: `s${i}`,
    class_arm: "arm-1",
    class_name: "JSS 1",
    arm_name: "A",
    subject: `subj-${i}`,
    subject_name: name(i),
    academic_period: "term-1",
    status: (awaiting.includes(i) ? "submitted" : "approved") as SubmissionStatus,
    submitted_by: null,
    submitted_at: null,
    reviewed_by: null,
    reviewed_at: null,
    review_comment: null,
  }));
}

// The reported case: 60 rows newest first, 4 awaiting at positions that fell on
// server pages 1, 2 and 3 before the backend could filter or order by status.
const AWAITING = [0, 30, 50, 55];
let term = makeTerm(60, AWAITING);
const requests: URLSearchParams[] = [];

// Behaves like the endpoint after backend cb9e018: ?status= filters,
// ?ordering=-status sorts, and an out-of-range page is DRF's 404.
function serveBackend() {
  server.use(
    http.get(apiUrl(RESULT_SUBMISSION_ENDPOINTS.LIST()), ({ request }) => {
      const params = new URL(request.url).searchParams;
      requests.push(params);
      const size = Number(params.get("page_size") ?? 25);
      const page = Number(params.get("page") ?? 1);
      let rows = term.filter((s) => !params.get("status") || s.status === params.get("status"));
      if (params.get("ordering")?.startsWith("-status")) {
        rows = [...rows].sort((a, b) => b.status.localeCompare(a.status));
      }
      const results = rows.slice((page - 1) * size, page * size);
      if (page > 1 && results.length === 0) return HttpResponse.json({ detail: "Invalid page." }, { status: 404 });
      return HttpResponse.json({
        count: rows.length,
        next: page * size < rows.length ? `?page=${page + 1}` : null,
        previous: null,
        results,
      });
    }),
  );
}

// The list's own requests, not the page_size=1 count lookups.
const listRequests = () => requests.filter((p) => p.get("page_size") !== "1");

describe("ReviewQueuePage", () => {
  beforeEach(() => {
    term = makeTerm(60, AWAITING);
    requests.length = 0;
    serveBackend();
  });

  it("opened from the dashboard's 'awaiting review', asks the server for exactly those", async () => {
    renderWithClient(<ReviewQueuePage initialStatus="submitted" />);

    for (const i of AWAITING) expect(await screen.findByText(name(i))).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText(/awaiting your review this term/)).toHaveTextContent("4 awaiting your review this term");
    expect(listRequests().every((p) => p.get("status") === "submitted")).toBe(true);
  });

  // Before the backend could order by status, page 1 held only one of these.
  it("unfiltered, lists every awaiting result first, with the whole-term count", async () => {
    renderWithClient(<ReviewQueuePage />);

    for (const i of AWAITING) expect(await screen.findByText(name(i))).toBeInTheDocument();
    expect(listRequests()[0].get("ordering")).toBe("-status,-created_at");
    expect(await screen.findByText(/listed first/)).toHaveTextContent(
      "4 awaiting your review this term, listed first",
    );
  });

  it("picking a status in the filters sends it to the server", async () => {
    const { user } = renderWithClient(<ReviewQueuePage />);
    await screen.findByText(name(0));

    await user.selectOptions(screen.getByRole("combobox", { name: "Filter by status" }), "submitted");

    await vi.waitFor(() => expect(listRequests().at(-1)?.get("status")).toBe("submitted"));
    expect(await screen.findByText(/this term$/)).toHaveTextContent("4 awaiting your review this term");
  });

  it("steps back a page when the last row of the current one moves away", async () => {
    // 27 awaiting: two pages. Then two are approved, leaving one page.
    term = makeTerm(27, Array.from({ length: 27 }, (_, i) => i));
    const { user, client } = renderWithClient(<ReviewQueuePage initialStatus="submitted" />);
    await screen.findByText("Page 1 of 2");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText(name(26))).toBeInTheDocument();

    term = makeTerm(27, Array.from({ length: 25 }, (_, i) => i));
    await client.invalidateQueries({ queryKey: ["results"] });

    // Back on page 1 (the controls hide once everything fits on one page),
    // showing its rows rather than an error for the page that's gone.
    expect(await screen.findByText(name(0))).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(25);
  });
});
