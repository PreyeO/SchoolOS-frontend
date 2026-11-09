import { describe, expect, it } from "vitest";

import { issuanceFingerprint, toPreviewPayload, type TargetInput } from "./issuance-target";

const input = (over: Partial<TargetInput> = {}): TargetInput => ({
  sessionId: "sess", channel: "sms", scope: "class", classId: "", armId: "", studentIds: [], ...over,
});

describe("toPreviewPayload", () => {
  it("sends only the field its scope needs", () => {
    expect(toPreviewPayload(input({ classId: "k1", armId: "a1" }))).toEqual({
      scope: "class", class_id: "k1", academic_session_id: "sess", channel: "sms",
    });
    expect(toPreviewPayload(input({ scope: "school", classId: "k1" }))).toEqual({
      scope: "school", academic_session_id: "sess", channel: "sms",
    });
  });

  it("is null until the scope's choice is made", () => {
    expect(toPreviewPayload(input())).toBeNull();
    expect(toPreviewPayload(input({ scope: "arm" }))).toBeNull();
    expect(toPreviewPayload(input({ scope: "selection" }))).toBeNull();
    expect(toPreviewPayload(input({ sessionId: "", scope: "school" }))).toBeNull();
  });
});

describe("issuanceFingerprint", () => {
  it("ignores the order students were picked in", () => {
    const a = toPreviewPayload(input({ scope: "selection", studentIds: ["s1", "s2"] }))!;
    const b = toPreviewPayload(input({ scope: "selection", studentIds: ["s2", "s1"] }))!;
    expect(issuanceFingerprint(a)).toBe(issuanceFingerprint(b));
  });

  it("changes with the channel, so a print can't reuse an SMS key", () => {
    const sms = toPreviewPayload(input({ classId: "k1" }))!;
    const print = toPreviewPayload(input({ classId: "k1", channel: "print" }))!;
    expect(issuanceFingerprint(sms)).not.toBe(issuanceFingerprint(print));
  });
});
