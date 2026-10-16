import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { estimateProration } from "./estimate-proration";

const NOW = new Date("2026-10-01T12:00:00Z");

// Subscribed at ₦1,000/student, 45 days (half a term) left.
const school = {
  student_capacity: 300,
  access_status: "subscribed" as const,
  price_per_student: 1000,
  subscription_ends_at: "2026-11-15T12:00:00Z",
};

describe("estimateProration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("charges the added students for the share of the term left", () => {
    // 50 students × ₦1,000 × 45/90 days.
    expect(estimateProration(school, 350)).toEqual({ studentsAdded: 50, daysRemaining: 45, amount: 25_000 });
  });

  it("charges nothing for a decrease or no change", () => {
    expect(estimateProration(school, 300)).toBeNull();
    expect(estimateProration(school, 200)).toBeNull();
  });

  it("charges nothing on trial or without a locked price", () => {
    expect(estimateProration({ ...school, access_status: "trialing" }, 400)).toBeNull();
    expect(estimateProration({ ...school, price_per_student: 0 }, 400)).toBeNull();
    expect(estimateProration({ ...school, subscription_ends_at: null }, 400)).toBeNull();
  });

  it("truncates partial days like Python's timedelta.days", () => {
    // 45 days and 23 hours still counts as 45.
    const almost46 = { ...school, subscription_ends_at: "2026-11-16T11:00:00Z" };
    expect(estimateProration(almost46, 310)?.daysRemaining).toBe(45);
  });

  it("charges ₦0 rather than a negative amount once the subscription has ended", () => {
    const ended = { ...school, subscription_ends_at: "2026-09-01T00:00:00Z" };
    expect(estimateProration(ended, 400)).toMatchObject({ daysRemaining: 0, amount: 0 });
  });
});
