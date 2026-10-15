import { describe, expect, it } from "vitest";

import { canAccessPath, findNavItemForPath, getNavGroupsForPersonas, type NavItem } from "./navigation";

function hrefs(groups: { items: NavItem[] }[]): string[] {
  const leaves = (items: NavItem[]): NavItem[] => items.flatMap((i) => (i.items ? leaves(i.items) : [i]));
  return leaves(groups.flatMap((g) => g.items)).map((i) => i.href);
}

describe("findNavItemForPath", () => {
  it("prefers the longest matching href", () => {
    expect(findNavItemForPath("/results/broadsheet")?.href).toBe("/results/broadsheet");
    expect(findNavItemForPath("/settings/grading")?.href).toBe("/settings/grading");
  });

  it("resolves a detail route to its list", () => {
    expect(findNavItemForPath("/students/639fb302-cd82")?.href).toBe("/students");
  });

  it("matches on whole path segments, not raw prefixes", () => {
    // "/students-archive" is not under "/students".
    expect(findNavItemForPath("/students-archive")?.href).not.toBe("/students");
  });
});

describe("canAccessPath", () => {
  it("lets a teacher into shared staff screens and keeps them out of admin ones", () => {
    expect(canAccessPath("/attendance", ["teacher"])).toBe(true);
    expect(canAccessPath("/students", ["teacher"])).toBe(false);
    expect(canAccessPath("/results/publish", ["teacher"])).toBe(false);
  });

  it("gates an admin item on the role's permission once it is known", () => {
    expect(canAccessPath("/students", ["admin"], ["view_students"])).toBe(true);
    expect(canAccessPath("/students", ["admin"], ["view_fees"])).toBe(false);
    expect(canAccessPath("/students/abc", ["admin"], [])).toBe(false);
  });

  it("allows while permissions are still loading (null)", () => {
    expect(canAccessPath("/students", ["admin"], null)).toBe(true);
  });

  it("doesn't let an admin permission take away a teacher's own access", () => {
    // Attendance reaches this user through the teacher persona, which no
    // admin role has anything to say about.
    expect(canAccessPath("/attendance", ["admin", "teacher"], [])).toBe(true);
  });

  it("allows paths the nav doesn't describe", () => {
    expect(canAccessPath("/onboarding/classes", ["parent"])).toBe(true);
  });
});

describe("getNavGroupsForPersonas", () => {
  it("never shows a group with nothing left in it", () => {
    for (const persona of ["admin", "teacher", "parent", "student"] as const) {
      for (const group of getNavGroupsForPersonas([persona], [])) {
        expect(group.items.length).toBeGreaterThan(0);
      }
    }
  });

  it("hides admin-only screens from a teacher, including nested results items", () => {
    const teacher = hrefs(getNavGroupsForPersonas(["teacher"]));
    expect(teacher).toEqual(expect.arrayContaining(["/results", "/attendance", "/my-classes"]));
    expect(teacher).not.toContain("/students");
    expect(teacher).not.toContain("/results/publish");
    expect(teacher).not.toContain("/results/review");
  });

  it("shows the union for someone who is both admin and teacher", () => {
    const both = hrefs(getNavGroupsForPersonas(["admin", "teacher"], ["view_students"]));
    expect(both).toEqual(expect.arrayContaining(["/results", "/results/publish", "/students"]));
  });

  it("drops a permission-gated item the admin's role lacks", () => {
    const feesOnly = hrefs(getNavGroupsForPersonas(["admin"], ["view_fees"]));
    expect(feesOnly).toContain("/fees");
    expect(feesOnly).not.toContain("/students");
  });

  it("hides unbuilt modules from everyone", () => {
    const all = getNavGroupsForPersonas(["admin", "teacher", "parent", "student"]);
    const leaves = (items: NavItem[]): NavItem[] => items.flatMap((i) => (i.items ? leaves(i.items) : [i]));
    expect(leaves(all.flatMap((g) => g.items)).some((i) => i.soon)).toBe(false);
  });
});
