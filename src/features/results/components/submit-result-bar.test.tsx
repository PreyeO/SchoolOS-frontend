// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RESULT_SUBMISSION_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { ResultSubmission } from "../types";
import { SubmitResultBar } from "./submit-result-bar";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const submission = { id: "sub-1", status: "draft" } as ResultSubmission;

function serveSubmit() {
  const calls: string[] = [];
  server.use(
    http.post(apiUrl(RESULT_SUBMISSION_ENDPOINTS.SUBMIT("sub-1")), () => {
      calls.push("submit");
      return HttpResponse.json({ ...submission, status: "submitted" });
    }),
  );
  return calls;
}

const COMPONENTS = [
  { id: "ca1", name: "CA 1" },
  { id: "ca2", name: "CA 2" },
  { id: "exam", name: "Exam" },
];

// Saved-score counts per assessment, for a class of 35.
function renderBar(entered: Record<string, number>) {
  return renderWithClient(
    <SubmitResultBar
      submission={submission}
      status="draft"
      savedCount={35}
      unsavedCount={0}
      components={COMPONENTS}
      enteredByComponent={new Map(Object.entries(entered))}
      studentCount={35}
    />,
  );
}

describe("SubmitResultBar", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends a complete sheet straight away, with no warning", async () => {
    const calls = serveSubmit();
    const { user } = renderBar({ ca1: 35, ca2: 35, exam: 35 });

    await user.click(screen.getByRole("button", { name: "Submit for review" }));

    await vi.waitFor(() => expect(calls).toEqual(["submit"]));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("stops a part-filled sheet and names what's missing", async () => {
    const calls = serveSubmit();
    const { user } = renderBar({ ca1: 35, ca2: 12 });

    await user.click(screen.getByRole("button", { name: "Submit for review" }));

    expect(await screen.findByRole("alertdialog", { name: /Some scores aren.t entered yet/ })).toBeInTheDocument();
    expect(screen.getByText("12 of 35 entered")).toBeInTheDocument();
    expect(screen.getByText("Not started")).toBeInTheDocument();
    // The safe choice is the one focused.
    expect(screen.getByRole("button", { name: "Keep entering scores" })).toHaveFocus();
    expect(calls).toEqual([]);
  });

  it("sends nothing when the teacher chooses to keep entering", async () => {
    const calls = serveSubmit();
    const { user } = renderBar({ ca1: 35, ca2: 35 });

    await user.click(screen.getByRole("button", { name: "Submit for review" }));
    await user.click(await screen.findByRole("button", { name: "Keep entering scores" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(calls).toEqual([]);
  });

  it("still lets them submit early on purpose", async () => {
    const calls = serveSubmit();
    const { user } = renderBar({ ca1: 35 });

    await user.click(screen.getByRole("button", { name: "Submit for review" }));
    await user.click(await screen.findByRole("button", { name: "Submit anyway" }));

    await vi.waitFor(() => expect(calls).toEqual(["submit"]));
  });
});
