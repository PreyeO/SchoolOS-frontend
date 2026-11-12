import { describe, expect, it } from "vitest";

import type { AuditLogEntry } from "@/features/audit-logs/types";

import { activityBand, agoLabel, byQuietest, daysSince, latestSchoolEntry } from "./school-activity";

function entry(id: string, actorId: string | null): AuditLogEntry {
  return {
    id, school: "s", school_name: "School", action: "attendance.marked", target_type: "x", target_id: "x",
    target_repr: "x", changes: null, created_at: "2026-11-01T10:00:00Z",
    actor: actorId ? { id: actorId, first_name: "A", last_name: "B", email: "", phone_number: null, photo: null } : null,
  };
}

describe("latestSchoolEntry", () => {
  it("skips SchoolOS staff actions so an extended trial doesn't look like use", () => {
    const entries = [entry("e1", "staff-1"), entry("e2", "teacher-1")];
    expect(latestSchoolEntry(entries, new Set(["staff-1"]))?.id).toBe("e2");
  });

  it("is null when only staff touched the school", () => {
    expect(latestSchoolEntry([entry("e1", "staff-1")], new Set(["staff-1"]))).toBeNull();
  });
});

describe("activityBand and daysSince", () => {
  it("bands by calendar days", () => {
    const now = new Date(2026, 10, 12, 8);
    expect(daysSince(new Date(2026, 10, 12, 1).toISOString(), now)).toBe(0);
    expect(daysSince(new Date(2026, 10, 4, 23).toISOString(), now)).toBe(8);
    expect([null, 0, 7, 8, 30, 31].map(activityBand)).toEqual(["never", "active", "active", "slowing", "slowing", "quiet"]);
    expect([null, 0, 1, 5].map(agoLabel)).toEqual(["Never", "Today", "Yesterday", "5 days ago"]);
  });
});

describe("byQuietest", () => {
  it("puts never-active first, then the longest silence, ties by name", () => {
    const rows = [
      { name: "B", days: 2 },
      { name: "C", days: 40 },
      { name: "A", days: null },
      { name: "A2", days: 40 },
    ];
    expect([...rows].sort(byQuietest).map((r) => r.name)).toEqual(["A", "A2", "C", "B"]);
  });
});
