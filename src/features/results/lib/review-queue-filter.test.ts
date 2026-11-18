import { describe, expect, it } from "vitest";

import type { ResultSubmission, SubmissionStatus } from "../types";
import { pageByStatus, parseStatusFilter, sortSubmissions } from "./review-queue-filter";

function sub(i: number, status: SubmissionStatus, over: Partial<ResultSubmission> = {}): ResultSubmission {
  return {
    id: `s${i}`,
    class_arm: "arm-1",
    class_name: "JSS 1",
    arm_name: "A",
    subject: `subj-${i}`,
    subject_name: `Subject ${String(i).padStart(2, "0")}`,
    academic_period: "term-1",
    status,
    submitted_by: null,
    submitted_at: null,
    reviewed_by: null,
    reviewed_at: null,
    review_comment: null,
    ...over,
  };
}

// The reported case: 60 rows in the backend's own order, 4 of them submitted
// at positions that land on server pages 1, 2 and 3 (25 per page).
const TERM = Array.from({ length: 60 }, (_, i) => sub(i, [0, 30, 50, 55].includes(i) ? "submitted" : "approved"));

describe("pageByStatus", () => {
  it("puts every row of one status together on page 1", () => {
    const { rows, count } = pageByStatus(TERM, { status: "submitted" }, 1, 25);
    expect(count).toBe(4);
    expect(rows.map((r) => r.id)).toEqual(["s0", "s30", "s50", "s55"]);
  });

  it("only goes to page 2 when one status has more than a page", () => {
    const many = Array.from({ length: 30 }, (_, i) => sub(i, "submitted"));
    expect(pageByStatus(many, { status: "submitted" }, 1, 25).rows).toHaveLength(25);
    expect(pageByStatus(many, { status: "submitted" }, 2, 25).rows).toHaveLength(5);
  });

  it("narrows by class and subject on top of status", () => {
    const rows = [
      sub(1, "submitted", { class_arm: "arm-1" }),
      sub(2, "submitted", { class_arm: "arm-2" }),
      sub(3, "submitted", { class_arm: "arm-2", subject: "maths" }),
    ];
    expect(pageByStatus(rows, { status: "submitted", classArmId: "arm-2" }, 1, 25).count).toBe(2);
    expect(pageByStatus(rows, { status: "submitted", classArmId: "arm-2", subjectId: "maths" }, 1, 25).count).toBe(1);
  });

  it("steps back a page when the list shrinks under you", () => {
    // Was on page 2 of 26 awaiting; one approved, so only one page is left.
    const left = Array.from({ length: 25 }, (_, i) => sub(i, "submitted"));
    const result = pageByStatus(left, { status: "submitted" }, 2, 25);
    expect(result.page).toBe(1);
    expect(result.rows).toHaveLength(25);
  });
});

describe("parseStatusFilter", () => {
  it("accepts the four statuses and treats anything else as all", () => {
    expect(parseStatusFilter("submitted")).toBe("submitted");
    expect(parseStatusFilter("rejected")).toBe("rejected");
    expect(parseStatusFilter("bogus")).toBe("");
    expect(parseStatusFilter(undefined)).toBe("");
  });
});

describe("sortSubmissions", () => {
  it("orders by what needs doing, then class, then subject", () => {
    const sorted = sortSubmissions([
      sub(1, "approved"),
      sub(2, "draft"),
      sub(3, "submitted", { class_name: "JSS 2" }),
      sub(4, "submitted", { class_name: "JSS 1" }),
      sub(5, "rejected"),
    ]);
    expect(sorted.map((s) => s.id)).toEqual(["s4", "s3", "s5", "s2", "s1"]);
  });
});
