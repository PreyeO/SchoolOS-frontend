import { describe, expect, it } from "vitest";

import { isSyntheticEmail } from "./is-synthetic-email";

describe("isSyntheticEmail", () => {
  it("recognises the generated student address", () => {
    expect(isSyntheticEmail("student.anu/001223139.fgc@internal.myschoolos.io")).toBe(true);
  });

  it("survives a change of backend domain", () => {
    // The gate on "reissue password" — a stale literal would silently hide it.
    expect(isSyntheticEmail("student.12.fgc@internal.schoolos.com")).toBe(true);
    expect(isSyntheticEmail("student.12.fgc@INTERNAL.example.org")).toBe(true);
  });

  it("treats a real address as real", () => {
    expect(isSyntheticEmail("joy@gmail.com")).toBe(false);
    expect(isSyntheticEmail("internal@school.ng")).toBe(false);
    expect(isSyntheticEmail("head@internal-school.ng")).toBe(false);
  });
});
