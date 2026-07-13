import type { SchoolLevelValue } from "@/data/school-levels";
import type { ClassTemplatesResponse } from "../types";
import type { ClassesFormValues } from "../schemas/classes-schema";

// Only these levels have class templates — nursery/creche start empty (add-your-own).
const TEMPLATE_LEVELS = ["primary", "junior_secondary", "senior_secondary"] as const;

export function buildClassesFromTemplates(
  schoolLevels: SchoolLevelValue[],
  templates: ClassTemplatesResponse,
): ClassesFormValues["classes"] {
  const classes: ClassesFormValues["classes"] = [];

  schoolLevels.forEach((level) => {
    if (!(TEMPLATE_LEVELS as readonly string[]).includes(level)) return;
    const items = templates[level as (typeof TEMPLATE_LEVELS)[number]] ?? [];
    [...items]
      .sort((a, b) => a.order - b.order)
      .forEach((item) => {
        classes.push({ name: item.name, level, arms: [{ name: `${item.name} A` }] });
      });
  });

  return classes;
}
