import { describe, expect, it } from "vitest";

import type { BroadsheetColumn, BroadsheetGridRow } from "../hooks/use-broadsheet";
import type { StudentSubjectResult } from "../types";
import { buildBroadsheetCsv } from "./broadsheet-csv";

const columns: BroadsheetColumn[] = [
  { subjectId: "eng", name: "English", hasAnyScore: true },
  { subjectId: "math", name: "Mathematics", hasAnyScore: true },
];

function result(subject: string, total: string, grade: string | null): StudentSubjectResult {
  return {
    id: `r-${subject}`,
    subject,
    subject_name: subject,
    total_score: total,
    grade,
    remark: null,
    grading_system_name: null,
    subject_position_in_arm: null,
    subject_position_in_class: null,
    computed_at: "2026-10-01T00:00:00Z",
  };
}

function row(overrides: Partial<BroadsheetGridRow> = {}): BroadsheetGridRow {
  return {
    studentId: "s1",
    name: "Ada Obi",
    admissionNumber: "ADM/001",
    bySubject: new Map([["eng", result("eng", "18.00", "F9")]]),
    total: null,
    average: null,
    position: null,
    isEmpty: false,
    ...overrides,
  };
}

function lines(csv: string): string[] {
  return csv.split("\r\n");
}

describe("buildBroadsheetCsv", () => {
  it("leads with the title, then a blank line, then the header", () => {
    const out = lines(buildBroadsheetCsv({ title: "JSS1 A — First Term", columns, rows: [row()], showGrades: false }));
    expect(out[0]).toBe('"JSS1 A — First Term"');
    expect(out[1]).toBe("");
    expect(out[2]).toBe('"Student","Admission No.","English","Mathematics","Total","Average","Position"');
  });

  it("leaves grades out entirely when they're switched off", () => {
    const out = lines(buildBroadsheetCsv({ title: "t", columns, rows: [row()], showGrades: false }));
    expect(out[3]).toBe('"Ada Obi","ADM/001","18","","","",""');
    expect(out.join("\n")).not.toContain("F9");
  });

  it("gives each grade its own column beside the score when switched on", () => {
    const out = lines(buildBroadsheetCsv({ title: "t", columns, rows: [row()], showGrades: true }));
    expect(out[2]).toBe(
      '"Student","Admission No.","English","English Grade","Mathematics","Mathematics Grade","Total","Average","Position"',
    );
    expect(out[3]).toBe('"Ada Obi","ADM/001","18","F9","","","","",""');
  });

  it("writes the server's total, average and position once locked", () => {
    const locked = row({ total: 152, average: 76, position: 2 });
    const [, , , line] = lines(buildBroadsheetCsv({ title: "t", columns, rows: [locked], showGrades: false }));
    expect(line).toMatch(/"152","76","2"$/);
  });

  it("neutralises a name a spreadsheet would run as a formula", () => {
    const [, , , line] = lines(
      buildBroadsheetCsv({ title: "t", columns, rows: [row({ name: "=HYPERLINK(1)" })], showGrades: false }),
    );
    expect(line).toContain('"\t=HYPERLINK(1)"');
  });
});
