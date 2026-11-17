import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";

import type { GradeComponentInput, GradeRangeInput, GradingSystem } from "../api/grading-api";
import type { GradingSystemFormValues } from "../schemas/grading-schema";

// The level picker's "every level without grading" choice. Not a real level:
// saving with it creates one system per remaining level.
export const ALL_LEVELS = "__all__";

export function levelLabel(level: string): string {
  return SCHOOL_LEVELS.find((l) => l.value === level)?.label ?? level;
}

// A grading setup as the API takes it: components numbered in order.
export interface GradingContent {
  components: GradeComponentInput[];
  ranges: GradeRangeInput[];
}

export function toContent(values: Pick<GradingSystemFormValues, "components" | "ranges">): GradingContent {
  return {
    components: values.components.map((c, i) => ({ name: c.name, max_obtainable: c.max_obtainable, order: i + 1 })),
    ranges: values.ranges.map((r) => ({ grade: r.grade, min_score: r.min_score, max_score: r.max_score, remark: r.remark })),
  };
}

// A saved system as form values: components in their order, grades from the top.
export function systemToValues(system: GradingSystem): GradingSystemFormValues {
  return {
    level: system.level,
    components: [...system.components]
      .sort((a, b) => a.order - b.order)
      .map((c) => ({ name: c.name, max_obtainable: c.max_obtainable })),
    ranges: [...system.ranges]
      .sort((a, b) => b.max_score - a.max_score)
      .map((r) => ({ grade: r.grade, min_score: r.min_score, max_score: r.max_score, remark: r.remark ?? "" })),
  };
}

// One level a setup can be copied to. systemId set: that level already has a
// system, which a copy REPLACES (PATCH; components are matched by name and
// updated in place, so existing scores are safe). Unset: a copy creates one.
export interface CopyTarget {
  level: SchoolLevelValue;
  systemId?: string;
}

// Every school level except the source, in school order.
export function copyTargets(source: SchoolLevelValue, schoolLevels: SchoolLevelValue[], systems: GradingSystem[]): CopyTarget[] {
  return schoolLevels
    .filter((level) => level !== source)
    .map((level) => ({ level, systemId: systems.find((s) => s.level === level)?.id }));
}
