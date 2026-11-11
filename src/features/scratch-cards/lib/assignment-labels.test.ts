import { describe, expect, it } from "vitest";

import type { CardAssignment, IssuanceBatch, ScratchCard } from "../types";
import { batchScopeName, batchTitle, REASON_LABEL } from "./assignment-labels";
import { cardNotes, cardWhereLine } from "./card-status";

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

// "No student yet" sat above "Given to a student" and read as a contradiction:
// a card's `student` is who it got locked to at the first check, not who
// it was given to.
describe("cardWhereLine", () => {
  const card = { is_revoked: false, revoked_at: null, student: null, active_assignment: false, pins_revealed_at: null } as unknown as ScratchCard;
  const used = { user: { first_name: "Ada", last_name: "Obi" }, admission_number: "ADM/001" } as ScratchCard["student"];

  it("says where each kind of card is, never 'No student yet'", () => {
    expect(cardWhereLine({ ...card, student: used, active_assignment: true })).toBe("Used by Ada Obi · ADM/001");
    expect(cardWhereLine({ ...card, active_assignment: true })).toBe("Given to a student · no results checked yet");
    expect(cardWhereLine({ ...card, pins_revealed_at: "2026-11-09T10:00:00Z" })).toBe("Anonymous printed slip · no results checked yet");
    expect(cardWhereLine(card)).toBe("In stock · not given out yet");
    expect(cardWhereLine({ ...card, is_revoked: true, revoked_at: "2026-11-11T16:54:00Z" })).toMatch(/^Replaced /);
  });
});

describe("cardNotes", () => {
  const base = { is_revoked: false, is_locked: false, student: null, active_assignment: false, failed_attempts: 0, revoked_at: null } as unknown as ScratchCard;

  it("has no notes for a card with nothing to warn about", () => {
    expect(cardNotes(base)).toEqual([]);
  });

  it("warns about wrong PIN tries before the lock, not after", () => {
    expect(cardNotes({ ...base, failed_attempts: 3 })).toEqual(["3 wrong PIN tries (locks at 5)"]);
    expect(cardNotes({ ...base, failed_attempts: 5, is_locked: true })).toEqual([]);
  });
});
