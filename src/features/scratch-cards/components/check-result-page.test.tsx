// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { RESULT_CHECK_ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import { CheckResultPage } from "./check-result-page";

const report = {
  student: { id: "st1", admission_number: "ADM-100", user: { first_name: "Tolu", last_name: "Ade" } },
  academic_period_id: "t1",
  subjects: [],
  summary: null,
  trait_ratings: [],
};

type Reply = () => Response;

function serve({ verify, preview }: { verify?: Reply; preview?: Reply } = {}) {
  const seen = { periodsQuery: "", verifyBodies: [] as unknown[], auth: [] as (string | null)[] };
  server.use(
    http.get(apiUrl(RESULT_CHECK_ENDPOINTS.PERIODS()), ({ request }) => {
      seen.periodsQuery = new URL(request.url).search;
      seen.auth.push(request.headers.get("authorization"));
      return HttpResponse.json({
        session_name: "2026/2027",
        periods: [{ id: "t1", name: "First Term", order: 1 }, { id: "t2", name: "Second Term", order: 2 }],
      });
    }),
    http.post(apiUrl(RESULT_CHECK_ENDPOINTS.VERIFY()), async ({ request }) => {
      seen.verifyBodies.push(await request.json());
      seen.auth.push(request.headers.get("authorization"));
      return verify ? verify() : HttpResponse.json(report);
    }),
    http.post(apiUrl(RESULT_CHECK_ENDPOINTS.VERIFY_PREVIEW()), () =>
      preview ? preview() : HttpResponse.text("<html><body>School report card</body></html>"),
    ),
  );
  return seen;
}

async function fillAndCheck(user: ReturnType<typeof renderWithClient>["user"], term = "First Term") {
  await user.type(screen.getByLabelText("Card serial number"), " abcd efgh ij ");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(await screen.findByRole("radio", { name: term }));
  await user.type(screen.getByLabelText("Admission number"), "ADM-100");
  await user.type(screen.getByLabelText("PIN"), "4821 930576");
  await user.click(screen.getByRole("button", { name: "Check result" }));
}

describe("CheckResultPage", () => {
  it("formats the serial, finds the card's terms, then shows the school's report card", async () => {
    const seen = serve();
    const { user } = renderWithClient(<CheckResultPage />);
    await fillAndCheck(user);

    expect(await screen.findByRole("heading", { name: "Tolu Ade" })).toBeInTheDocument();
    expect(screen.getByText("First Term · 2026/2027")).toBeInTheDocument();
    expect(await screen.findByTitle("Tolu Ade report card")).toBeInTheDocument();
    expect(seen.periodsQuery).toBe("?serial=ABCD-EFGH-IJ");
    expect(seen.verifyBodies).toEqual([
      { serial: "ABCD-EFGH-IJ", pin: "4821930576", admission_number: "ADM-100", academic_period_id: "t1" },
    ]);
  });

  it("falls back to the plain result if the branded card can't load", async () => {
    serve({ preview: () => HttpResponse.json({ detail: "Rendering failed." }, { status: 500 }) });
    const { user } = renderWithClient(<CheckResultPage />);
    await fillAndCheck(user);
    await screen.findByRole("heading", { name: "Tolu Ade" });
    expect(await screen.findByText("No subject results yet for this term.")).toBeInTheDocument();
    expect(screen.queryByTitle("Tolu Ade report card")).not.toBeInTheDocument();
  });

  it("checks another term without retyping the card", async () => {
    const seen = serve();
    const { user } = renderWithClient(<CheckResultPage />);
    await fillAndCheck(user);
    await user.click(await screen.findByRole("button", { name: /Another term/ }));

    await user.click(await screen.findByRole("radio", { name: "Second Term" }));
    await user.click(screen.getByRole("button", { name: "Check result" }));
    await screen.findByRole("heading", { name: "Tolu Ade" });
    expect(seen.verifyBodies[1]).toEqual({
      serial: "ABCD-EFGH-IJ", pin: "4821930576", admission_number: "ADM-100", academic_period_id: "t2",
    });
  });

  it("shows the server's refusal next to the form", async () => {
    serve({ verify: () => HttpResponse.json({ detail: "Invalid scratch card, PIN, or student identifier." }, { status: 400 }) });
    const { user } = renderWithClient(<CheckResultPage />);
    await fillAndCheck(user);
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid scratch card, PIN, or student identifier.");
  });

  it("won't look up an incomplete serial, and says what one looks like", async () => {
    const seen = serve();
    const { user } = renderWithClient(<CheckResultPage />);
    await user.type(screen.getByLabelText("Card serial number"), "ABCD");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText(/10 letters and numbers/)).toBeInTheDocument();
    expect(seen.periodsQuery).toBe("");
  });

  it("keeps a signed-in user's token off these public calls", async () => {
    useAuthStore.setState({ tokens: { access: "stale-token", refresh: "r" } });
    const seen = serve();
    const { user } = renderWithClient(<CheckResultPage />);
    await fillAndCheck(user);
    await screen.findByRole("heading", { name: "Tolu Ade" });
    expect(seen.auth).toEqual([null, null]);
  });
});
