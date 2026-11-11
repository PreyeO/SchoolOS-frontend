// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import { GRADING_SYSTEM_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { GradingSystem } from "../api/grading-api";
import { GradingPage } from "./grading-page";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/school/get-school-id", () => ({ getSchoolId: () => "school-1" }));
vi.mock("@/lib/school/use-school-levels", () => ({
  useSchoolLevels: () => ({ levels: ["nursery", "primary", "junior_secondary"], isLoading: false }),
}));

const primary: GradingSystem = {
  id: "g-pri",
  level: "primary",
  name: null,
  created_at: "2026-01-01T00:00:00Z",
  components: [{ id: "c1", name: "Exam", max_obtainable: 100, order: 1 }],
  ranges: [{ id: "r1", grade: "A", min_score: 0, max_score: 100, remark: null }],
};

describe("GradingPage add form", () => {
  it("'All levels' creates the same setup on every level that has none", async () => {
    const levels: string[] = [];
    server.use(
      http.get(apiUrl(GRADING_SYSTEM_ENDPOINTS.LIST()), () =>
        HttpResponse.json({ count: 1, next: null, previous: null, results: [primary] }),
      ),
      http.post(apiUrl(GRADING_SYSTEM_ENDPOINTS.LIST()), async ({ request }) => {
        levels.push(((await request.json()) as { level: string }).level);
        return HttpResponse.json({});
      }),
    );
    const { user } = renderWithClient(<GradingPage />);

    await user.click(await screen.findByRole("button", { name: /add grading system/i }));
    await user.selectOptions(screen.getByLabelText("School level"), "All 2 levels without grading");
    await user.click(screen.getByRole("button", { name: "Save" }));

    // Primary already has grading, so it's left alone.
    await waitFor(() => expect(levels).toEqual(["nursery", "junior_secondary"]));
    expect(toast.success).toHaveBeenCalledWith("Grading saved for 2 levels.");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
