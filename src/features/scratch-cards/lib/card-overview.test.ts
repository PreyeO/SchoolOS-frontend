import { describe, expect, it } from "vitest";

import type { IssuancePreview, PreviewRow } from "../types";
import { buildCardOverview, filterStudents } from "./card-overview";

const row = (id: string, name: string) =>
  ({ student_id: id, student_name: name, admission_number: `ADM/${id}`, pages: 1 }) as PreviewRow;

const preview = {
  eligible: [row("1", "Tobi Ade"), row("2", "Ifeoma Nwosu")],
  no_number: [row("3", "Yusuf Garba")],
  invalid_number: [row("4", "Amaka Udo")],
  already_has_card: [row("5", "Ada Obi")],
  not_enrolled: [row("6", "Left Student")],
  not_found: [],
  stock_available: 60,
  credits_required: 2,
  wallet_balance: 1200,
} as unknown as IssuancePreview;

describe("buildCardOverview", () => {
  const o = buildCardOverview(preview);

  it("counts enrolled students only, split by card and phone", () => {
    expect(o).toMatchObject({ total: 5, haveCard: 1, waiting: 4, ready: 2, needsNumber: 2, stockLeft: 60, credits: 1200 });
  });

  it("lists students alphabetically, never the not-enrolled ones", () => {
    expect(o.students.map((s) => s.student_name)).toEqual(["Ada Obi", "Amaka Udo", "Ifeoma Nwosu", "Tobi Ade", "Yusuf Garba"]);
    expect(o.students.find((s) => s.student_name === "Yusuf Garba")?.state).toBe("needs_number");
  });
});

describe("filterStudents", () => {
  const { students } = buildCardOverview(preview);
  const names = (list: typeof students) => list.map((s) => s.student_name);

  it("waiting = everyone without a card, numbers or not", () => {
    expect(names(filterStudents(students, "waiting", ""))).toEqual(["Amaka Udo", "Ifeoma Nwosu", "Tobi Ade", "Yusuf Garba"]);
  });

  it("filters by state and searches name or admission number", () => {
    expect(names(filterStudents(students, "needs_number", ""))).toEqual(["Amaka Udo", "Yusuf Garba"]);
    expect(names(filterStudents(students, "has_card", ""))).toEqual(["Ada Obi"]);
    expect(names(filterStudents(students, "all", "adm/3"))).toEqual(["Yusuf Garba"]);
  });
});
