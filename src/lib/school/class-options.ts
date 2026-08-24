import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";

import type { ClassRecord } from "./class-record";

export interface ClassOption {
  classId: string;
  label: string;
  level: SchoolLevelValue;
}

export interface ClassOptionGroup {
  level: SchoolLevelValue;
  levelLabel: string;
  options: ClassOption[];
}

// Classes as pickable units, grouped by level in school order.
//
// The class-level sibling of buildArmOptions, and deliberately not a wrapper
// around it: that one flattens each class into its arms because enrollment,
// attendance and teaching assignments all key off a class_arm_id. Fee items key
// off the Class itself — JSS 1 A and JSS 1 B are billed identically — so an arm
// never appears here, and the placeholder-arm rule that shapes buildArmOptions
// has nothing to do. A class with no arms at all is still perfectly billable,
// which is why armlessClasses' exclusion doesn't apply either.
export function buildClassOptions(classes: ClassRecord[]): ClassOptionGroup[] {
  const options: ClassOption[] = [...classes]
    .sort((a, b) => a.order - b.order)
    .map((klass) => ({
      classId: klass.id,
      label: klass.name,
      level: klass.level as SchoolLevelValue,
    }));

  return SCHOOL_LEVELS.map((l) => ({
    level: l.value,
    levelLabel: l.label,
    options: options.filter((o) => o.level === l.value),
  })).filter((g) => g.options.length > 0);
}
