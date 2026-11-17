import { describe, expect, it } from "vitest";

import { buildPinsPdf } from "./pins-pdf";
import { PAGE, SLIP_HEIGHT, SLIP_WIDTH, SLIPS_PER_PAGE, slipPosition } from "./slip-layout";

const details = { schoolName: "Federal Government College", sessionName: "2026/2027", checkUrl: "myschoolos.io/check-result" };
const pins = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ serial: `ABCD-EFGH-${String(i).padStart(2, "0")}`, pin: "0012345678" }));

describe("slipPosition", () => {
  it("fills two columns, top to bottom, ten to a page", () => {
    expect(slipPosition(0)).toEqual({ page: 0, x: PAGE.margin, y: PAGE.margin });
    expect(slipPosition(1).x).toBeGreaterThan(slipPosition(0).x);
    expect(slipPosition(2).y).toBeGreaterThan(slipPosition(0).y);
    expect(slipPosition(SLIPS_PER_PAGE)).toEqual({ page: 1, x: PAGE.margin, y: PAGE.margin });
  });

  it("keeps every slip inside the page margins", () => {
    for (let i = 0; i < SLIPS_PER_PAGE; i++) {
      const { x, y } = slipPosition(i);
      expect(x + SLIP_WIDTH).toBeLessThanOrEqual(PAGE.width - PAGE.margin + 0.001);
      expect(y + SLIP_HEIGHT).toBeLessThanOrEqual(PAGE.height - PAGE.margin + 0.001);
    }
  });
});

describe("buildPinsPdf", () => {
  it("adds a page for every ten cards", async () => {
    expect((await buildPinsPdf(pins(1), details)).getNumberOfPages()).toBe(1);
    expect((await buildPinsPdf(pins(10), details)).getNumberOfPages()).toBe(1);
    expect((await buildPinsPdf(pins(11), details)).getNumberOfPages()).toBe(2);
  });

  it("embeds the school's logo once, however many slips", async () => {
    // A 1×1 PNG stands in for a real logo.
    const logo = {
      dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
      width: 1,
      height: 1,
    };
    const text = (await buildPinsPdf(pins(11), details, logo)).output();
    expect(text.match(/\/Subtype \/Image/g)).toHaveLength(1);
    expect(text).toContain("Federal Government College");
  });

  it("still builds without a logo", async () => {
    const text = (await buildPinsPdf(pins(1), details, null)).output();
    expect(text).not.toContain("/Subtype /Image");
  });

  it("prints each serial and PIN, keeping a PIN's leading zeros", async () => {
    const text = (await buildPinsPdf(pins(2), details)).output();
    expect(text).toContain("ABCD-EFGH-00");
    expect(text).toContain("ABCD-EFGH-01");
    expect(text).toContain("0 0 1 2 3 4 5 6 7 8");
    expect(text).toContain("Federal Government College");
  });
});
