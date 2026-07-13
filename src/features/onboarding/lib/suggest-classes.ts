import type { SchoolLevelValue } from "@/data/school-levels";
import type { ClassFormValues } from "../schemas/classes-schema";

const LEVEL_CLASS_NAMES: Record<SchoolLevelValue, string[]> = {
  creche: ["Baby Room", "Toddler", "Pre-Nursery"],
  nursery: ["Nursery 1", "Nursery 2", "KG"],
  primary: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"],
  junior_secondary: ["JSS 1", "JSS 2", "JSS 3"],
  senior_secondary: ["SSS 1", "SSS 2", "SSS 3"],
};

export function suggestClasses(levels: SchoolLevelValue[]): ClassFormValues[] {
  return levels.flatMap((level) =>
    LEVEL_CLASS_NAMES[level].map((name) => ({
      name,
      level,
      arms: [{ name: `${name} A` }],
    })),
  );
}
