import { describe, expect, it } from "vitest";

import type { SchoolLevelValue } from "@/data/school-levels";
import type { SchoolAccessStatus } from "@/lib/school/get-school-detail";

import type { SchoolFinancialRow } from "../types";
import { buildPlatformReach } from "./platform-reach";

let seq = 0;
function row(opts: {
  state: string;
  city: string;
  students?: number;
  capacity?: number;
  access?: SchoolAccessStatus;
  levels?: SchoolLevelValue[];
}): SchoolFinancialRow {
  seq += 1;
  return {
    school: {
      id: `s${seq}`,
      name: `School ${seq}`,
      slug: `s${seq}`,
      subdomain: `s${seq}.myschoolos.io`,
      school_type: "secondary",
      levels: opts.levels ?? ["junior_secondary"],
      city: opts.city,
      state: opts.state,
      logo: null,
      is_active: true,
      access_status: opts.access ?? "subscribed",
      created_at: "2026-01-01T00:00:00Z",
    },
    access_status: opts.access ?? "subscribed",
    student_capacity: opts.capacity ?? 0,
    student_count: opts.students ?? 0,
    billable_students: 0,
    price_per_student: 0,
    price_is_locked: false,
    estimated_termly_revenue: 0,
  };
}

describe("buildPlatformReach", () => {
  it("returns zeroes, not NaN or gaps, for no schools", () => {
    const reach = buildPlatformReach([]);
    expect(reach).toMatchObject({ students: 0, capacity: 0, states: [], cityCount: 0 });
    expect(reach.access).toEqual({ subscribed: 0, trialing: 0, expired: 0 });
    expect(reach.levels.every((l) => l.schools === 0)).toBe(true);
  });

  it("sums students and capacity across schools", () => {
    const reach = buildPlatformReach([
      row({ state: "LAGOS", city: "Ikeja", students: 120, capacity: 300 }),
      row({ state: "RIVERS", city: "Port Harcourt", students: 80, capacity: 200 }),
    ]);
    expect(reach.students).toBe(200);
    expect(reach.capacity).toBe(500);
  });

  it("counts a city once however it was typed", () => {
    const reach = buildPlatformReach([
      row({ state: "LAGOS", city: "Ikeja" }),
      row({ state: "LAGOS", city: "  ikeja " }),
      row({ state: "LAGOS", city: "IKEJA" }),
    ]);
    expect(reach.cityCount).toBe(1);
    expect(reach.states[0].cities).toEqual(["Ikeja"]);
  });

  it("treats the same city name in two states as two places", () => {
    const reach = buildPlatformReach([
      row({ state: "LAGOS", city: "Ikeja" }),
      row({ state: "OGUN", city: "Ikeja" }),
    ]);
    expect(reach.cityCount).toBe(2);
  });

  it("labels states and orders them by schools, then students", () => {
    const reach = buildPlatformReach([
      row({ state: "RIVERS", city: "PH", students: 900 }),
      row({ state: "LAGOS", city: "Ikeja", students: 10 }),
      row({ state: "LAGOS", city: "Yaba", students: 10 }),
      row({ state: "DELTA", city: "Warri", students: 1000 }),
    ]);
    expect(reach.states.map((s) => s.label)).toEqual(["Lagos", "Delta", "Rivers"]);
    expect(reach.states[0]).toMatchObject({ schools: 2, students: 20 });
  });

  it("falls back to the raw value for a state it doesn't know", () => {
    const reach = buildPlatformReach([row({ state: "ATLANTIS", city: "X" })]);
    expect(reach.states[0].label).toBe("ATLANTIS");
  });

  it("tallies access status and every level a school offers", () => {
    const reach = buildPlatformReach([
      row({ state: "LAGOS", city: "A", access: "trialing", levels: ["primary", "junior_secondary"] }),
      row({ state: "LAGOS", city: "B", access: "expired", levels: ["primary"] }),
    ]);
    expect(reach.access).toEqual({ subscribed: 0, trialing: 1, expired: 1 });
    const byValue = Object.fromEntries(reach.levels.map((l) => [l.value, l.schools]));
    expect(byValue).toMatchObject({ primary: 2, junior_secondary: 1, creche: 0 });
  });
});
