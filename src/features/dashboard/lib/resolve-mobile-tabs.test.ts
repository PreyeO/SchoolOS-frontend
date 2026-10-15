import { describe, expect, it } from "vitest";

import { MAX_LINK_TABS, MOBILE_TABS } from "@/data/nav/mobile-tabs";
import { getNavGroupsForPersonas, type Persona, type PermissionSet } from "@/data/navigation";

import { resolveMobileTabs } from "./resolve-mobile-tabs";

function tabsFor(persona: Persona, permissions: PermissionSet = null): string[] {
  return resolveMobileTabs(MOBILE_TABS[persona], getNavGroupsForPersonas([persona], permissions)).map(
    (t) => t.label,
  );
}

describe("resolveMobileTabs", () => {
  it("gives each persona its configured bar", () => {
    expect(tabsFor("teacher")).toEqual(["Home", "Register", "Scores", "Classes", "More"]);
    expect(tabsFor("parent")).toEqual(["Home", "Results", "Fees", "Notices", "More"]);
    expect(tabsFor("student")).toEqual(["Home", "Results", "Fees", "Notices", "More"]);
  });

  it("caps an admin's priority list at four links plus More", () => {
    expect(tabsFor("admin")).toEqual(["Home", "Students", "Fees", "Review", "More"]);
  });

  it("drops tabs the admin's role can't open and promotes the next ones", () => {
    // A fees-only role: no view_students, so Notices moves up.
    expect(tabsFor("admin", ["view_fees"])).toEqual(["Home", "Fees", "Review", "Notices", "More"]);
    // A roleless admin: no gaps and no tab that would 403.
    expect(tabsFor("admin", [])).toEqual(["Home", "Review", "Notices", "More"]);
  });

  it("never exceeds the bar's width and always ends in More", () => {
    for (const persona of ["admin", "teacher", "parent", "student"] as const) {
      const tabs = tabsFor(persona);
      expect(tabs.length).toBeLessThanOrEqual(MAX_LINK_TABS + 1);
      expect(tabs.at(-1)).toBe("More");
    }
  });

  it("borrows each tab's icon from the nav item", () => {
    const groups = getNavGroupsForPersonas(["teacher"]);
    const register = resolveMobileTabs(MOBILE_TABS.teacher, groups).find((t) => t.href === "/attendance");
    const navItem = groups.flatMap((g) => g.items).find((i) => i.href === "/attendance");
    expect(register?.icon).toBe(navItem?.icon);
  });

  it("is empty for a persona with no bar", () => {
    expect(resolveMobileTabs(undefined, [])).toEqual([]);
  });
});
