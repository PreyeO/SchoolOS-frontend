import { describe, expect, it } from "vitest";

import { formatNigerianPhone, looksLikeNigerianMobile, toE164 } from "./phone";

describe("looksLikeNigerianMobile", () => {
  it("accepts every shape the backend accepts", () => {
    for (const raw of ["08031234567", "8031234567", "2348031234567", "+234 803 123 4567", "0803-123-4567"]) {
      expect(looksLikeNigerianMobile(raw)).toBe(true);
    }
  });

  it("rejects short numbers, foreign numbers and Lagos landlines", () => {
    expect(looksLikeNigerianMobile("0803123456")).toBe(false);
    expect(looksLikeNigerianMobile("+447911123456")).toBe(false);
    expect(looksLikeNigerianMobile("012345678")).toBe(false);
    expect(looksLikeNigerianMobile("")).toBe(false);
  });
});

describe("toE164", () => {
  it("sends every accepted shape as +234…", () => {
    for (const raw of ["08031234567", "8031234567", "2348031234567", " 0803 123-4567 "]) {
      expect(toE164(raw)).toBe("+2348031234567");
    }
  });
});

describe("formatNigerianPhone", () => {
  it("shows stored E.164 the way people write it", () => {
    expect(formatNigerianPhone("+2348031234567")).toBe("0803 123 4567");
  });

  it("leaves anything unparseable as stored", () => {
    expect(formatNigerianPhone("+447911123456")).toBe("+447911123456");
  });
});
