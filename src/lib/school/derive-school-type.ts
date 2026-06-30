import type { SchoolLevelValue } from "@/data/school-levels";

export type SchoolType = "nursery" | "primary" | "secondary" | "combined";

const CANONICAL_ORDER: SchoolLevelValue[] = [
  "creche",
  "nursery",
  "primary",
  "junior_secondary",
  "senior_secondary",
];

const EARLY_YEARS = new Set<SchoolLevelValue>(["creche", "nursery"]);
const PRIMARY = new Set<SchoolLevelValue>(["primary"]);
const SECONDARY = new Set<SchoolLevelValue>(["junior_secondary", "senior_secondary"]);

export function deriveSchoolType(levels: SchoolLevelValue[]): SchoolType {
  const inEarly = levels.some((l) => EARLY_YEARS.has(l));
  const inPrimary = levels.some((l) => PRIMARY.has(l));
  const inSecondary = levels.some((l) => SECONDARY.has(l));

  const bandCount = [inEarly, inPrimary, inSecondary].filter(Boolean).length;
  if (bandCount > 1) return "combined";
  if (inSecondary) return "secondary";
  if (inPrimary) return "primary";
  return "nursery";
}

export function sortLevels(levels: SchoolLevelValue[]): SchoolLevelValue[] {
  return [...levels].sort(
    (a, b) => CANONICAL_ORDER.indexOf(a) - CANONICAL_ORDER.indexOf(b)
  );
}
