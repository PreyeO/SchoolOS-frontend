import { describe, expect, it } from "vitest";

import { backLink, batchHref, parseBatchOrigin } from "./batch-back-link";

describe("send page back link", () => {
  // Reported: opened from Records → Past sends, "back" went to the overview.
  it("goes back to Records (Past sends) when opened from there", () => {
    const href = batchHref("b1", { from: "records" });
    expect(href).toBe("/scratch-cards/batches/b1?from=records");
    expect(backLink(parseBatchOrigin("records", undefined))).toEqual({ href: "/scratch-cards/records?tab=sends", label: "Records" });
  });

  it("goes back to the student when opened from their card history", () => {
    expect(batchHref("b1", { from: "student", studentId: "s9" })).toBe("/scratch-cards/batches/b1?from=student&student=s9");
    expect(backLink(parseBatchOrigin("student", "s9"))).toEqual({ href: "/students/s9", label: "Back to the student" });
  });

  it("falls back to Result cards for a plain or unexpected link", () => {
    expect(batchHref("b1")).toBe("/scratch-cards/batches/b1");
    expect(backLink(parseBatchOrigin(undefined, undefined)).href).toBe("/scratch-cards");
    expect(backLink(parseBatchOrigin("student", undefined)).href).toBe("/scratch-cards"); // no id: can't go there
    expect(backLink(parseBatchOrigin("elsewhere", undefined)).href).toBe("/scratch-cards");
  });
});
