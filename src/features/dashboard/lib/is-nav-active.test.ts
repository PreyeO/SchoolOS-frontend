import { describe, expect, it } from "vitest";

import { isNavActive } from "./is-nav-active";

describe("isNavActive", () => {
  it("lights only the exact screen, not its parent route", () => {
    // Score Entry lives at /results; it must not stay lit on a sibling.
    expect(isNavActive("/results", "/results/broadsheet")).toBe(false);
    expect(isNavActive("/results/broadsheet", "/results/broadsheet")).toBe(true);
    expect(isNavActive("/results", "/results")).toBe(true);
  });

  it("keeps the list row lit on its detail pages", () => {
    expect(isNavActive("/students", "/students/abc-123")).toBe(true);
  });

  it("treats /dashboard as exact only", () => {
    expect(isNavActive("/dashboard", "/dashboard")).toBe(true);
    expect(isNavActive("/dashboard", "/dashboard/anything")).toBe(false);
    expect(isNavActive("/dashboard", "/some-unknown-page")).toBe(false);
  });
});
