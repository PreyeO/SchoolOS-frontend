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

const AWAITING = [0, 30, 50, 55];
const TERM: ResultSubmission[] = Array.from({ length: 60 }, (_, i) => ({
  id: `s${i}`,
  class_arm: "arm-1",
  class_name: "JSS 1",
  arm_name: "A",
  subject: `subj-${i}`,
  subject_name: `Subject ${String(i).padStart(2, "0")}`,
  academic_period: "term-1",
  status: (AWAITING.includes(i) ? "submitted" : "approved") as SubmissionStatus,
  submitted_by: null,
  submitted_at: null,
  reviewed_by: null,
  reviewed_at: null,
  review_comment: null,
}));

// Pages like the real endpoint: in its own order, page_size per page, and no
// status filter at all.
function serveBackend() {
  server.use(
    http.get(apiUrl(RESULT_SUBMISSION_ENDPOINTS.LIST()), ({ request }) => {
      const url = new URL(request.url);
      const size = Number(url.searchParams.get("page_size") ?? 25);
      const page = Number(url.searchParams.get("page") ?? 1);
      const results = TERM.slice((page - 1) * size, page * size);
      return HttpResponse.json({
        count: TERM.length,
        next: page * size < TERM.length ? `?page=${page + 1}` : null,
        previous: null,
        results,
      });
    }),
  );
}

const awaitingNames = AWAITING.map((i) => `Subject ${String(i).padStart(2, "0")}`);

describe("ReviewQueuePage", () => {
  beforeEach(() => serveBackend());

  it("opened from the dashboard's 'awaiting review', shows all of them together", async () => {
    renderWithClient(<ReviewQueuePage initialStatus="submitted" />);

    for (const name of awaitingNames) expect(await screen.findByText(name)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText(/awaiting your review this term/)).toHaveTextContent("4 awaiting your review this term");
  });

  // What the user saw: unfiltered, the server's page 1 holds only one of them.
  it("unfiltered, still pages the server and says the count is for this page", async () => {
    renderWithClient(<ReviewQueuePage />);

    expect(await screen.findByText("Subject 00")).toBeInTheDocument();
    expect(screen.queryByText("Subject 30")).not.toBeInTheDocument();
    expect(screen.getByText(/awaiting your review on this/)).toHaveTextContent("1 awaiting your review on this page");
  });

  it("picking the status in the filters gathers them too", async () => {
    const { user } = renderWithClient(<ReviewQueuePage />);
    await screen.findByText("Subject 00");

    await user.selectOptions(screen.getByRole("combobox", { name: "Filter by status" }), "submitted");

    for (const name of awaitingNames) expect(await screen.findByText(name)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });
});
