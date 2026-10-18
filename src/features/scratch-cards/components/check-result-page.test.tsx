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

function serve(verify: () => Response = () => HttpResponse.json(report)) {
  const seen = { periodsQuery: "", verifyBody: null as unknown, auth: [] as (string | null)[] };
  server.use(
    http.get(apiUrl(RESULT_CHECK_ENDPOINTS.PERIODS()), ({ request }) => {
      seen.periodsQuery = new URL(request.url).search;
      seen.auth.push(request.headers.get("authorization"));
      return HttpResponse.json({ session_name: "2026/2027", periods: [{ id: "t1", name: "First Term", order: 1 }] });
    }),
    http.post(apiUrl(RESULT_CHECK_ENDPOINTS.VERIFY()), async ({ request }) => {
      seen.verifyBody = await request.json();
      seen.auth.push(request.headers.get("authorization"));
      return verify();
    }),
  );
  return seen;
}

async function fillAndCheck(user: ReturnType<typeof renderWithClient>["user"]) {
  await user.type(screen.getByLabelText("Card serial number"), " abcd-efgh-ij ");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.selectOptions(await screen.findByLabelText("Term"), "t1");
  await user.type(screen.getByLabelText("Student's admission number"), "ADM-100");
  await user.type(screen.getByLabelText("PIN"), "4821 930576");
  await user.click(screen.getByRole("button", { name: "Check result" }));
}

describe("CheckResultPage", () => {
  it("finds the card's terms by serial, then shows the result", async () => {
    const seen = serve();
    const { user } = renderWithClient(<CheckResultPage />);
    await fillAndCheck(user);

    expect(await screen.findByRole("heading", { name: "Tolu Ade" })).toBeInTheDocument();
    expect(seen.periodsQuery).toBe("?serial=ABCD-EFGH-IJ");
    expect(seen.verifyBody).toEqual({
      serial: "ABCD-EFGH-IJ",
      pin: "4821930576",
      admission_number: "ADM-100",
      academic_period_id: "t1",
    });
  });

  it("never puts the PIN in a URL", async () => {
    const seen = serve();
    const { user } = renderWithClient(<CheckResultPage />);
    await fillAndCheck(user);
    await screen.findByRole("heading", { name: "Tolu Ade" });
    expect(seen.periodsQuery).not.toContain("4821930576");
  });

  it("shows the server's refusal next to the form", async () => {
    serve(() => HttpResponse.json({ detail: "Invalid scratch card, PIN, or student identifier." }, { status: 400 }));
    const { user } = renderWithClient(<CheckResultPage />);
    await fillAndCheck(user);
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid scratch card, PIN, or student identifier.");
  });

  it("says when a serial isn't recognised", async () => {
    server.use(
      http.get(apiUrl(RESULT_CHECK_ENDPOINTS.PERIODS()), () =>
        HttpResponse.json({ detail: "Scratch card not found." }, { status: 400 }),
      ),
    );
    const { user } = renderWithClient(<CheckResultPage />);
    await user.type(screen.getByLabelText("Card serial number"), "NOPE");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Scratch card not found.");
    expect(screen.queryByLabelText("PIN")).not.toBeInTheDocument();
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
