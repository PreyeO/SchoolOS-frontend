import { describe, expect, it } from "vitest";

import type { BehavioralTrait } from "../types";
import { resolveTraitView } from "./trait-view";

let seq = 0;
function trait(over: Partial<BehavioralTrait>): BehavioralTrait {
  seq += 1;
  return { id: `t${seq}`, level: "primary", category: "affective", name: `Trait ${seq}`, order: seq, is_active: true, ...over };
}

describe("resolveTraitView", () => {
  it("offers no categories when the school rates no behaviour", () => {
    expect(resolveTraitView([], "primary", "affective")).toEqual({ categories: [], category: null, traits: [] });
    expect(resolveTraitView(undefined, "primary", "psychomotor").category).toBeNull();
  });

  it("falls to the only category with traits, whatever was picked", () => {
    const punctuality = trait({ name: "Punctuality" });
    const view = resolveTraitView([punctuality], "primary", "psychomotor");
    expect(view.categories).toEqual(["affective"]);
    expect(view.category).toBe("affective");
    expect(view.traits).toEqual([punctuality]);
  });

  it("keeps the teacher's pick when both categories have traits", () => {
    const a = trait({ category: "affective" });
    const p = trait({ category: "psychomotor" });
    const view = resolveTraitView([a, p], "primary", "psychomotor");
    expect(view.categories).toEqual(["affective", "psychomotor"]);
    expect(view.traits).toEqual([p]);
  });

  it("ignores other levels' traits and deactivated ones", () => {
    const view = resolveTraitView(
      [trait({ level: "jss" }), trait({ is_active: false })],
      "primary",
      "affective",
    );
    expect(view.categories).toEqual([]);
  });

  it("orders traits by their configured order", () => {
    const second = trait({ name: "Neatness", order: 2 });
    const first = trait({ name: "Punctuality", order: 1 });
    expect(resolveTraitView([second, first], "primary", "affective").traits.map((t) => t.name)).toEqual([
      "Punctuality",
      "Neatness",
    ]);
  });
});
