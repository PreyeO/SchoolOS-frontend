// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ENDPOINTS } from "@/lib/api/endpoints";
import { usePersonaStore } from "@/stores/persona-store";
import { meResponse, signInAs } from "@/test/fixtures";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import { RouteAccessGuard } from "./route-access-guard";

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

const DENIED = "This page isn’t available to your account";

// Signs in, serves /me for that membership, and opens a route.
function visit(pathname: string, personas: string[], permissions: string[] = []) {
  nav.pathname = pathname;
  signInAs("m1", personas);
  server.use(http.get(apiUrl(ENDPOINTS.ME), () => HttpResponse.json(meResponse("m1", personas, permissions))));
  return renderWithClient(
    <RouteAccessGuard>
      <p>The page</p>
    </RouteAccessGuard>,
  );
}

describe("RouteAccessGuard", () => {
  beforeEach(() => {
    nav.pathname = "/";
  });

  it("lets a teacher into a screen teachers share", async () => {
    visit("/attendance", ["teacher"]);
    expect(await screen.findByText("The page")).toBeInTheDocument();
  });

  it("keeps a teacher out of an admin screen typed into the address bar", async () => {
    visit("/settings/grading", ["teacher"]);
    expect(await screen.findByRole("heading", { name: DENIED })).toBeInTheDocument();
    expect(screen.queryByText("The page")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to dashboard" })).toHaveAttribute("href", "/dashboard");
  });

  it("keeps an admin out once /me shows their role lacks the permission", async () => {
    visit("/students", ["admin"], ["view_fees"]);
    expect(await screen.findByRole("heading", { name: DENIED })).toBeInTheDocument();
  });

  it("lets an admin in when their role has the permission", async () => {
    visit("/students", ["admin"], ["view_students"]);
    expect(await screen.findByText("The page")).toBeInTheDocument();
  });

  it("offers an admin working as a teacher a switch instead of a dead end", async () => {
    usePersonaStore.setState({ byMembership: { m1: "teacher" } });
    const { user } = visit("/results/publish", ["admin", "teacher"], ["view_results"]);

    const heading = await screen.findByRole("heading", { name: "This page is part of your Admin profile" });
    expect(heading).toBeInTheDocument();

    // Switching keeps them on this URL, which is the page they came for.
    await user.click(screen.getByRole("button", { name: "Switch to Admin" }));
    expect(await screen.findByText("The page")).toBeInTheDocument();
  });

  it("doesn't offer a switch to a profile that couldn't open the page either", async () => {
    usePersonaStore.setState({ byMembership: { m1: "teacher" } });
    visit("/students", ["admin", "teacher"], ["view_fees"]);
    expect(await screen.findByRole("heading", { name: DENIED })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Switch to/ })).not.toBeInTheDocument();
  });
});
