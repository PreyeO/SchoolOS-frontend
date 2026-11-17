import { describe, expect, it } from "vitest";

import type { GradingSystem } from "../api/grading-api";
import { copyTargets, systemToValues, toContent } from "./grading-copy";

const primary: GradingSystem = {
  id: "g-pri",
  level: "primary",
  name: null,
  created_at: "2026-01-01T00:00:00Z",
  components: [
    { id: "c2", name: "Exam", max_obtainable: 60, order: 2 },
    { id: "c1", name: "CA", max_obtainable: 40, order: 1 },
  ],
  ranges: [
    { id: "r2", grade: "F", min_score: 0, max_score: 49, remark: null },
    { id: "r1", grade: "A", min_score: 50, max_score: 100, remark: "Pass" },
  ],
};

describe("systemToValues + toContent", () => {
  it("round-trips a saved system into an API payload, components in order and grades from the top", () => {
    expect(toContent(systemToValues(primary))).toEqual({
      components: [
        { name: "CA", max_obtainable: 40, order: 1 },
        { name: "Exam", max_obtainable: 60, order: 2 },
      ],
      ranges: [
        { grade: "A", min_score: 50, max_score: 100, remark: "Pass" },
        { grade: "F", min_score: 0, max_score: 49, remark: "" },
      ],
    });
  });
});

describe("copyTargets", () => {
  it("lists every other school level, marking the ones that already have grading", () => {
    const jss: GradingSystem = { ...primary, id: "g-jss", level: "junior_secondary" };
    expect(copyTargets("primary", ["nursery", "primary", "junior_secondary"], [primary, jss])).toEqual([
      { level: "nursery", systemId: undefined },
      { level: "junior_secondary", systemId: "g-jss" },
    ]);
  });

  it("is empty for a school with a single level", () => {
    expect(copyTargets("primary", ["primary"], [primary])).toEqual([]);
  });
});
