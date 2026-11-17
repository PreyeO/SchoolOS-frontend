import type { ClassOptionGroup } from "@/lib/school/class-options";

import type { FeeItem } from "../types";

export interface FeeLine {
  name: string;
  amount: number;
}

export interface ClassCopyPlan {
  toCreate: FeeLine[];
  // Names the class already bills this term, left exactly as they are.
  skipped: string[];
}

// What copying `source` onto one class adds. The backend refuses a second
// active fee of the same name (case-insensitively) on a class and term, so a
// name the class already has is skipped rather than sent to fail, and its
// amount is never touched: a copy only ever adds.
export function planClassCopy(source: FeeLine[], existing: FeeItem[]): ClassCopyPlan {
  const have = new Set(existing.filter((i) => i.is_active).map((i) => i.name.trim().toLowerCase()));
  const plan: ClassCopyPlan = { toCreate: [], skipped: [] };
  for (const line of source) {
    if (have.has(line.name.trim().toLowerCase())) plan.skipped.push(line.name);
    else plan.toCreate.push({ name: line.name, amount: line.amount });
  }
  return plan;
}

// Starts ticked: the source's classmates at the same level (JSS 2 and JSS 3
// for JSS 1), the usual case of a whole level billed alike.
export function sameLevelClassIds(groups: ClassOptionGroup[], sourceClassId: string): string[] {
  const group = groups.find((g) => g.options.some((o) => o.classId === sourceClassId));
  return (group?.options ?? []).map((o) => o.classId).filter((id) => id !== sourceClassId);
}
