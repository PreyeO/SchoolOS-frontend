import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";
import type { ClassTemplatesResponse } from "../types";
import type { ClassesFormValues } from "../schemas/classes-schema";

export function buildClassesFromTemplates(
  schoolLevels: SchoolLevelValue[],
  templates: ClassTemplatesResponse,
): ClassesFormValues["classes"] {
  const classes: ClassesFormValues["classes"] = [];

  // Only the school's own levels — never a level it didn't select — walked in
  // school order (creche → SSS) rather than the order the owner happened to tick
  // the boxes in at create-school. A level the backend has no template for
  // (creche) contributes nothing and is left for add-your-own.
  SCHOOL_LEVELS.map((l) => l.value)
    .filter((level) => schoolLevels.includes(level))
    .forEach((level) => {
      const items = templates[level] ?? [];
      [...items]
        .sort((a, b) => a.order - b.order)
        .forEach((item) => {
          // No arms by default — arms are optional; the user adds one only if
          // their school actually runs parallel classes.
          classes.push({ name: item.name, level, arms: [] });
        });
    });

  return classes;
}
