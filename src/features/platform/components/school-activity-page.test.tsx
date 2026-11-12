// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { AUDIT_LOG_ENDPOINTS, PLATFORM_ADMIN_ENDPOINTS, SCHOOL_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import { SchoolActivityPage } from "./school-activity-page";

const page = <T,>(results: T[]) => ({ count: results.length, next: null, previous: null, results });
const school = (id: string, name: string) => ({
  id, name, slug: id, subdomain: `${id}.schoolos.com`, school_type: "secondary", levels: [], city: "Lagos",
  state: "Lagos", logo: null, is_active: true, access_status: "trialing", created_at: "2026-09-01T00:00:00Z",
});
const person = (id: string, first: string) => ({ id, first_name: first, last_name: "Obi", email: "", phone_number: null, photo: null });
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const log = (actor: ReturnType<typeof person>, action: string, when: string) => ({
  id: `${actor.id}-${when}`, actor, school: "s", school_name: "School", action, target_type: "x", target_id: "x",
  target_repr: "JSS 1 A", changes: null, created_at: when,
});

const staff = person("staff-1", "Staffer");
const ENTRIES: Record<string, unknown[]> = {
  busy: [log(person("t1", "Ada"), "attendance.marked", daysAgo(1))],
  // The newest entry is SchoolOS extending its trial; the school itself last acted 45 days ago.
  dormant: [log(staff, "school.access_extended", daysAgo(0)), log(person("o1", "Femi"), "score.entered", daysAgo(45))],
  fresh: [],
};

function serve() {
  server.use(
    http.get(apiUrl(SCHOOL_ENDPOINTS.LIST()), () =>
      HttpResponse.json(page([school("busy", "Busy College"), school("dormant", "Dormant Academy"), school("fresh", "Fresh School")])),
    ),
    http.get(apiUrl(PLATFORM_ADMIN_ENDPOINTS.LIST()), () =>
      HttpResponse.json(page([{ id: "pa1", user: staff, platform_admin_role: null, is_active: true, created_at: "" }])),
    ),
    http.get(apiUrl(AUDIT_LOG_ENDPOINTS.LIST()), ({ request }) => {
      const id = new URL(request.url).searchParams.get("school_id") ?? "";
      return HttpResponse.json(page(ENTRIES[id] ?? []));
    }),
  );
}

function schoolNames() {
  return screen.getAllByRole("link").map((a) => a.textContent);
}

describe("SchoolActivityPage", () => {
  it("lists quietest first and ignores SchoolOS staff actions", async () => {
    serve();
    renderWithClient(<SchoolActivityPage />);
    await screen.findByText("Busy College");
    await screen.findByText("Dormant Academy");

    expect(schoolNames()).toEqual(["Fresh School", "Dormant Academy", "Busy College"]);
    const dormant = screen.getByText("Dormant Academy").closest("tr") as HTMLElement;
    expect(within(dormant).getByText("Gone quiet")).toBeInTheDocument();
    expect(within(dormant).getByText(/45 days ago/)).toBeInTheDocument();
  });

  it("filters to the schools that have gone quiet", async () => {
    serve();
    const { user } = renderWithClient(<SchoolActivityPage />);
    await screen.findByText("Dormant Academy");
    await screen.findByText("Busy College");

    await user.click(screen.getByRole("button", { name: /gone quiet/i }));
    expect(schoolNames()).toEqual(["Dormant Academy"]);
  });
});
