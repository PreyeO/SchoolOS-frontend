import { describe, expect, it } from "vitest";

import type { ResultSubmission, SubmissionStatus } from "../types";
import { parseStatusFilter, sortSubmissions } from "./review-queue-filter";

function sub(i: number, status: SubmissionStatus, over: Partial<ResultSubmission> = {}): ResultSubmission {
  return {
    id: `s${i}`,
    class_arm: "arm-1",
    class_name: "JSS 1",
    arm_name: "A",
    subject: `subj-${i}`,
    subject_name: `Subject ${i}`,
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

  // The server is asked for ordering=-status. That only matches this order
  // because the status strings sort that way; pin it so a renamed status
  // can't silently break the server-side priority.
  it("matches descending alphabetical order of the status strings", () => {
    const statuses: SubmissionStatus[] = ["approved", "draft", "rejected", "submitted"];
    const byServer = [...statuses].sort().reverse();
    const byUs = sortSubmissions(statuses.map((s, i) => sub(i, s))).map((s) => s.status);
    expect(byUs).toEqual(byServer);
  });
});
