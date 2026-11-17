import { describe, expect, it } from "vitest";

import type { ClassOptionGroup } from "@/lib/school/class-options";

import type { FeeItem } from "../types";
import { planClassCopy, sameLevelClassIds } from "./fee-copy";

function item(name: string, amount: number, is_active = true): FeeItem {
  return {
    id: name, klass: "k", class_name: "JSS 2", academic_period: "p", academic_period_name: "First Term",
    session_name: "2026/2027", name, amount, is_active, created_at: "2026-09-01T00:00:00Z",
  };
}

describe("planClassCopy", () => {
  it("adds only the fees a class lacks, matching names case-insensitively, and never touches an existing amount", () => {
    const source = [{ name: "Tuition", amount: 50000 }, { name: "PTA", amount: 2000 }, { name: "Books", amount: 8000 }];
    expect(planClassCopy(source, [item("tuition ", 45000), item("Books", 8000, false)])).toEqual({
      toCreate: [{ name: "PTA", amount: 2000 }, { name: "Books", amount: 8000 }],
      skipped: ["Tuition"],
    });
  });
});

describe("sameLevelClassIds", () => {
  const groups: ClassOptionGroup[] = [
    { level: "primary", levelLabel: "Primary", options: [{ classId: "p1", label: "Primary 1", level: "primary" }] },
    {
      level: "junior_secondary",
      levelLabel: "Junior Secondary (JSS)",
      options: ["j1", "j2", "j3"].map((id, i) => ({ classId: id, label: `JSS ${i + 1}`, level: "junior_secondary" as const })),
    },
  ];

  it("ticks the source's classmates at its level, not itself and not other levels", () => {
    expect(sameLevelClassIds(groups, "j1")).toEqual(["j2", "j3"]);
  });
});
