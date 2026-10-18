import { describe, expect, it } from "vitest";

import { formatPinInput, formatSerialInput } from "./format-serial";

describe("formatSerialInput", () => {
  it("adds the dashes as the parent types", () => {
    expect(formatSerialInput("ab")).toBe("AB");
    expect(formatSerialInput("abcde")).toBe("ABCD-E");
    expect(formatSerialInput("abcdefghi")).toBe("ABCD-EFGH-I");
    expect(formatSerialInput("abcdefghij")).toBe("ABCD-EFGH-IJ");
  });

  it("tidies a pasted serial with spaces or its own dashes", () => {
    expect(formatSerialInput(" abcd efgh ij ")).toBe("ABCD-EFGH-IJ");
    expect(formatSerialInput("ABCD-EFGH-IJ")).toBe("ABCD-EFGH-IJ");
  });

  it("stops at ten characters", () => {
    expect(formatSerialInput("ABCDEFGHIJKLMN")).toBe("ABCD-EFGH-IJ");
  });
});

describe("formatPinInput", () => {
  it("keeps digits only, up to ten, including leading zeros", () => {
    expect(formatPinInput("0482 193 0576")).toBe("0482193057");
    expect(formatPinInput("12a3")).toBe("123");
  });
});
