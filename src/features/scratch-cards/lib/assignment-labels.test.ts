import { describe, expect, it } from "vitest";

import type { CardAssignment, IssuanceBatch, ScratchCard } from "../types";
import { batchScopeName, batchTitle, REASON_LABEL } from "./assignment-labels";
import { cardNotes } from "./card-status";

const assignment = (reason: CardAssignment["reason"]) => ({ reason }) as CardAssignment;
const classes = [
  { id: "k1", name: "JSS1", level: "junior_secondary", order: 1, arms: [{ id: "a1", name: "A", is_active: true, is_default: false }] },
] as never;

describe("batchTitle", () => {
  // The reported page: reason "lost", titled "Texted 1 card".
  it("calls a send of replacements what it is", () => {
    expect(batchTitle({ channel: "sms", student_count: 1, assignments: [assignment("lost")] } as IssuanceBatch)).toBe(
      "Texted 1 replacement card",
    );
  });

  it("keeps plain wording for first cards, or a mix", () => {
    expect(batchTitle({ channel: "print", student_count: 2, assignments: [assignment("issued"), assignment("lost")] } as IssuanceBatch)).toBe(
      "Printed 2 cards",
    );
  });

  it("labels every reason", () => {
    expect(REASON_LABEL.never_arrived).toBe("Replacement: never arrived");
  });
});

describe("batchScopeName", () => {
  it("names the class from scope_detail, and falls back while classes load", () => {
    const batch = { scope: "class", student_count: 30, scope_detail: { type: "class", class_id: "k1" } } as IssuanceBatch;
    expect(batchScopeName(batch, classes)).toBe("JSS1");
    expect(batchScopeName(batch, [])).toBe("One class");
  });
});

describe("cardNotes", () => {
  const base = { is_revoked: false, is_locked: false, student: null, active_assignment: false, failed_attempts: 0, revoked_at: null } as unknown as ScratchCard;

  it("tells an issued-but-unused card apart from stock", () => {
    expect(cardNotes({ ...base, active_assignment: true })).toEqual(["Given to a student, not used yet"]);
    expect(cardNotes(base)).toEqual([]);
  });

  it("warns about wrong PIN tries before the lock, not after", () => {
    expect(cardNotes({ ...base, failed_attempts: 3 })).toEqual(["3 wrong PIN tries (locks at 5)"]);
    expect(cardNotes({ ...base, failed_attempts: 5, is_locked: true })).toEqual([]);
  });
});
