import { describe, expect, it } from "vitest";

import { weekendDayName } from "./weekend";

describe("weekendDayName", () => {
  it("names Saturdays and Sundays", () => {
    expect(weekendDayName("2026-10-10")).toBe("Saturday");
    expect(weekendDayName("2026-10-11")).toBe("Sunday");
  });

  it("is null on school days", () => {
    for (const date of ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"]) {
      expect(weekendDayName(date)).toBeNull();
    }
  });

  it("is null for something that isn't a date", () => {
    expect(weekendDayName("")).toBeNull();
    expect(weekendDayName("next saturday")).toBeNull();
  });
});
