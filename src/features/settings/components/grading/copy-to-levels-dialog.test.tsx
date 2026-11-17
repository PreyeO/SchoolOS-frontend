// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GRADING_SYSTEM_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { GradingSystem } from "../../api/grading-api";
import { CopyToLevelsDialog } from "./copy-to-levels-dialog";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const primary: GradingSystem = {
  id: "g-pri",
  level: "primary",
  name: null,
  created_at: "2026-01-01T00:00:00Z",
  components: [{ id: "c1", name: "Exam", max_obtainable: 100, order: 1 }],
  ranges: [{ id: "r1", grade: "A", min_score: 0, max_score: 100, remark: null }],
};
const jss: GradingSystem = { ...primary, id: "g-jss", level: "junior_secondary" };
const content = {
  components: [{ name: "Exam", max_obtainable: 100, order: 1 }],
  ranges: [{ grade: "A", min_score: 0, max_score: 100, remark: "" }],
};

// Records what the dialog sends; `refuse` names a level whose create fails.
function captureRequests(refuse?: string) {
  const sent: { method: string; url: string; body: unknown }[] = [];
  const record = async ({ request }: { request: Request }) => {
    const body = (await request.json()) as { level?: string };
    sent.push({ method: request.method, url: new URL(request.url).pathname, body });
    if (refuse && body.level === refuse) return HttpResponse.json({ detail: "Level is locked." }, { status: 400 });
    return HttpResponse.json({});
  };
  server.use(
    http.post(apiUrl(GRADING_SYSTEM_ENDPOINTS.LIST()), record),
    http.patch(apiUrl(GRADING_SYSTEM_ENDPOINTS.DETAIL("g-jss")), record),
    http.get(apiUrl(GRADING_SYSTEM_ENDPOINTS.LIST()), () => HttpResponse.json({ count: 0, next: null, previous: null, results: [] })),
  );
  return sent;
}

async function open(schoolLevels: GradingSystem["level"][] = ["nursery", "primary", "junior_secondary"]) {
  const view = renderWithClient(<CopyToLevelsDialog source={primary} systems={[primary, jss]} schoolLevels={schoolLevels} />);
  await view.user.click(screen.getByRole("button", { name: /copy to other levels/i }));
  return view;
}

describe("CopyToLevelsDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is not offered when the school has no other level", () => {
    renderWithClient(<CopyToLevelsDialog source={primary} systems={[primary]} schoolLevels={["primary"]} />);
    expect(screen.queryByRole("button", { name: /copy to other levels/i })).not.toBeInTheDocument();
  });

  it("pre-ticks only levels without grading, so nothing is overwritten by default", async () => {
    const sent = captureRequests();
    const { user } = await open();
    expect(screen.getByRole("checkbox", { name: /nursery/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /junior secondary/i })).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "Copy to 1 level" }));
    await waitFor(() => expect(sent).toEqual([{ method: "POST", url: "/api/grading-systems/", body: { level: "nursery", ...content } }]));
    expect(toast.success).toHaveBeenCalledWith("Grading saved for 1 level.");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("replaces a level that already has grading only when it is ticked, and warns first", async () => {
    const sent = captureRequests();
    const { user } = await open();
    await user.click(screen.getByRole("checkbox", { name: /junior secondary/i }));
    expect(screen.getByText(/current grading will be replaced/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Copy to 2 levels" }));
    await waitFor(() => expect(sent).toHaveLength(2));
    expect(sent[1]).toEqual({ method: "PATCH", url: "/api/grading-systems/g-jss/", body: content });
    expect(toast.success).toHaveBeenCalledWith("Grading saved for 2 levels.");
  });

  it("reports a refused level by name and still saves the rest", async () => {
    const sent = captureRequests("nursery");
    const { user } = await open(["nursery", "primary", "junior_secondary", "senior_secondary"]);
    await user.click(screen.getByRole("button", { name: "Copy to 2 levels" }));

    await waitFor(() => expect(sent).toHaveLength(2));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Nursery / Pre-school: Level is locked."));
    expect(toast.success).toHaveBeenCalledWith("Grading saved for 1 level.");
  });

  it("can't copy with nothing ticked", async () => {
    const { user } = await open();
    await user.click(screen.getByRole("checkbox", { name: /nursery/i }));
    expect(screen.getByRole("button", { name: "Copy to 0 levels" })).toBeDisabled();
  });
});
