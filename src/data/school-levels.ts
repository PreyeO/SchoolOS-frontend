export const SCHOOL_LEVELS = [
  {
    value: "creche",
    label: "Creche / Daycare",
    description: "Early childhood care (ECCD)",
  },
  {
    value: "nursery",
    label: "Nursery / Pre-school",
    description: "Pre-nursery, nursery, KG",
  },
  {
    value: "primary",
    label: "Primary",
    description: "Primary 1–6",
  },
  {
    value: "junior_secondary",
    label: "Junior Secondary (JSS)",
    description: "JSS 1–3",
  },
  {
    value: "senior_secondary",
    label: "Senior Secondary (SSS)",
    description: "SSS 1–3",
  },
] as const;

export type SchoolLevelValue = (typeof SCHOOL_LEVELS)[number]["value"];
