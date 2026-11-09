import { describe, expect, it } from "vitest";

import { student } from "@/test/fixtures";

import { whyNotReplaceable } from "./why-not-replaceable";

const base = { pins_revealed_at: null, is_revoked: false, is_locked: false, student: null };

describe("whyNotReplaceable", () => {
  // Regression: a printed slip was told it was "in stock" and would get a
  // fresh PIN on issue, which stopped being true in backend b87df1a.
  it("never calls a printed slip stock", () => {
    const text = whyNotReplaceable({ ...base, pins_revealed_at: "2026-11-09T10:00:00Z" });
    expect(text).toMatch(/printed when it was bought/);
    expect(text).not.toMatch(/in stock/);
  });

  it("calls an unrevealed, unbound card stock", () => {
    expect(whyNotReplaceable(base)).toMatch(/It's in stock/);
  });

  it("explains a used card from before the reveal stamp existed", () => {
    expect(whyNotReplaceable({ ...base, student: student("s1") })).toMatch(/handed out without a named student/);
  });
});
