// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { FeeItemsBlockers } from "@/features/fees/components/fee-items-blockers";
import { NotBilledNotice } from "@/features/fees/components/not-billed-notice";
import { NoSubjectsRow } from "@/features/results/components/broadsheet-empty";
import { BroadsheetNotices } from "@/features/results/components/broadsheet-notices";
import { LeaderboardEmpty } from "@/features/results/components/leaderboard-empty";
import { NoTermsNotice } from "@/features/results/components/no-terms-notice";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { meResponse, signInAs } from "@/test/fixtures";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

// "Never link someone to a screen they can't open" (PROJECT.md). Each of these
// hints sits on a screen a teacher can reach and points at an admin screen,
// so a teacher must get the sentence without the link, and an admin with the
// right role must get the link.
const CASES: { name: string; href: string; ui: React.ReactElement }[] = [
  { name: "no terms yet", href: "/settings/sessions", ui: <NoTermsNotice consequence="nothing can be shown" /> },
  { name: "empty overall leaderboard", href: "/results/publish", ui: <LeaderboardEmpty mode="overall" armLabel="JSS1 A" /> },
  { name: "unpublished broadsheet", href: "/results/publish", ui: <BroadsheetNotices isLocked={false} missingScores={2} emptyColumns={0} /> },
  { name: "arm with no subjects", href: "/teaching-assignments", ui: <NoSubjectsRow armLabel="JSS1 A" /> },
  { name: "student not billed", href: "/students", ui: <NotBilledNotice studentName="Ada" termLabel="First term" /> },
  { name: "fees without classes", href: "/classes", ui: <FeeItemsBlockers hasClasses={false} hasTerms /> },
  { name: "fees without terms", href: "/settings/sessions", ui: <FeeItemsBlockers hasClasses hasTerms={false} /> },
];

const FULL_ROLE = ["view_students", "view_staff", "view_parents", "view_fees", "view_results", "manage_academic_structure"];

// Renders as a given membership and waits for /me, so permissions are real
// rather than "still loading", which the app treats as allowed.
async function renderAs(ui: React.ReactElement, personas: string[], permissions: string[] = []) {
  signInAs("m1", personas);
  server.use(http.get(apiUrl(ENDPOINTS.ME), () => HttpResponse.json(meResponse("m1", personas, permissions))));
  const view = renderWithClient(ui);
  await waitFor(() => expect(view.client.getQueryState(["me"])?.status).toBe("success"));
  return view;
}

function linkTo(href: string) {
  return screen.queryAllByRole("link").find((a) => a.getAttribute("href") === href);
}

describe.each(CASES)("hint: $name", ({ href, ui }) => {
  it("gives a teacher the sentence without the link", async () => {
    const { container } = await renderAs(ui, ["teacher"]);
    expect(linkTo(href)).toBeUndefined();
    expect(container).not.toBeEmptyDOMElement();
  });

  it("gives an admin with the role the link", async () => {
    await renderAs(ui, ["admin"], FULL_ROLE);
    expect(linkTo(href)).toBeDefined();
  });
});

it("hides a link from an admin whose role can't open it", async () => {
  await renderAs(<NotBilledNotice studentName="Ada" termLabel="First term" />, ["admin"], ["view_fees"]);
  expect(linkTo("/students")).toBeUndefined();
});
