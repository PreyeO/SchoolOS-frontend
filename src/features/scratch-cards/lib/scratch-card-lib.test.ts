import { describe, expect, it } from "vitest";

import { student } from "@/test/fixtures";

import { cardStatus } from "./card-status";
import { buildPinsCsv } from "./pins-csv";

describe("cardStatus", () => {
  const base = { is_revoked: false, is_locked: false, student: null };

  it("reads unused, used, locked and replaced in order of finality", () => {
    expect(cardStatus(base)).toBe("unused");
    expect(cardStatus({ ...base, student: student("s1") })).toBe("used");
    expect(cardStatus({ ...base, student: student("s1"), is_locked: true })).toBe("locked");
    expect(cardStatus({ ...base, student: student("s1"), is_locked: true, is_revoked: true })).toBe("replaced");
  });
});

describe("buildPinsCsv", () => {
  it("writes serial, PIN and session per card with Windows line endings", () => {
    const csv = buildPinsCsv([{ serial: "ABCD-EFGH-IJ", pin: "0012345678" }], "2026/2027");
    expect(csv.split("\r\n")).toEqual(['"serial","pin","session"', '"ABCD-EFGH-IJ","0012345678","2026/2027"']);
  });

  it("keeps a PIN's leading zeros as text", () => {
    // Quoted, so the file holds them; a spreadsheet may still need the column set to text.
    expect(buildPinsCsv([{ serial: "S", pin: "0007" }], "x")).toContain('"0007"');
  });
});
