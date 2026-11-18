import { describe, expect, it } from "vitest";

import { findIncompleteComponents } from "./incomplete-components";

const CA1 = { id: "ca1", name: "CA 1" };
const CA2 = { id: "ca2", name: "CA 2" };
const EXAM = { id: "exam", name: "Exam" };

describe("findIncompleteComponents", () => {
  it("lists every assessment short of the class size, in order", () => {
    const gaps = findIncompleteComponents([CA1, CA2, EXAM], new Map([["ca1", 35], ["ca2", 12]]), 35);
    expect(gaps).toEqual([
      { id: "ca2", name: "CA 2", entered: 12, total: 35 },
      { id: "exam", name: "Exam", entered: 0, total: 35 },
    ]);
  });

  it("is empty once every assessment is full", () => {
    expect(findIncompleteComponents([CA1, EXAM], new Map([["ca1", 35], ["exam", 35]]), 35)).toEqual([]);
  });

  it("caps entered at the class size, so a departed student's score can't hide a gap", () => {
    // 36 saved against a roster of 35: still complete, never "36 of 35".
    expect(findIncompleteComponents([CA1], new Map([["ca1", 36]]), 35)).toEqual([]);
  });

  it("reports nothing for an empty roster", () => {
    expect(findIncompleteComponents([CA1, EXAM], new Map(), 0)).toEqual([]);
  });
});
