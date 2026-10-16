import { describe, expect, it } from "vitest";

import type { BulkImportAppliedRow } from "../types";
import { buildBulkImportCredentialsCsv } from "./bulk-import-credentials-csv";

function row(overrides: Partial<BulkImportAppliedRow>): BulkImportAppliedRow {
  return {
    row: 2,
    first_name: "Ada",
    last_name: "Obi",
    admission_number: "ADM/001",
    gender: "female",
    date_of_birth: null,
    email: "student.adm001.fgc@internal.myschoolos.io",
    class_name: "JSS1",
    arm_name: "A",
    class_arm_id: "arm-1",
    password: "Xk7-pq92",
    password_note: null,
    ...overrides,
  };
}

function lines(csv: string): string[] {
  return csv.split("\r\n");
}

describe("buildBulkImportCredentialsCsv", () => {
  it("writes a header and one quoted line per student, with Windows line endings", () => {
    const out = lines(buildBulkImportCredentialsCsv([row({})]));
    expect(out[0]).toBe('"first_name","last_name","admission_number","email","password","note"');
    expect(out[1]).toBe(
      '"Ada","Obi","ADM/001","student.adm001.fgc@internal.myschoolos.io","Xk7-pq92",""',
    );
  });

  it("explains a missing password instead of leaving the row blank", () => {
    const reused = row({ password: null, password_note: "Existing account linked" });
    const unexplained = row({ password: null, password_note: null });
    const [, a, b] = lines(buildBulkImportCredentialsCsv([reused, unexplained]));
    expect(a).toMatch(/"","Existing account linked"$/);
    expect(b).toMatch(/"","Existing account kept"$/);
  });

  it("escapes quotes inside a value", () => {
    const [, line] = lines(buildBulkImportCredentialsCsv([row({ last_name: 'O"Brien' })]));
    expect(line).toContain('"O""Brien"');
  });

  it("neutralises cells a spreadsheet would run as a formula", () => {
    const risky = row({ first_name: "=HYPERLINK(1)", last_name: "+1", admission_number: "-5", email: "@x" });
    const [, line] = lines(buildBulkImportCredentialsCsv([risky]));
    for (const value of ["=HYPERLINK(1)", "+1", "-5", "@x"]) {
      expect(line).toContain(`"\t${value}"`);
    }
  });

  it("leaves a dash inside a value alone", () => {
    const [, line] = lines(buildBulkImportCredentialsCsv([row({})]));
    expect(line).toContain('"Xk7-pq92"');
  });
});
