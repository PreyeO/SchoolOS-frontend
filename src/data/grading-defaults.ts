import type { SchoolLevelValue } from "./school-levels";

export interface DefaultGradeComponent {
  name: string;
  max_obtainable: number;
}

export interface DefaultGradeRange {
  grade: string;
  min_score: number;
  max_score: number;
  remark: string;
}

// A common Nigerian CA/exam split — user can edit weights or add/remove rows,
// as long as they still sum to 100 (enforced by the schema, mirroring the backend).
export const DEFAULT_GRADE_COMPONENTS: DefaultGradeComponent[] = [
  { name: "1st CA", max_obtainable: 20 },
  { name: "2nd CA", max_obtainable: 20 },
  { name: "Exam", max_obtainable: 60 },
];

// WAEC/NERDC's standard 9-point scale — the convention senior secondary schools
// expect. Other levels default to a simpler 5-band A–F scale. Both are just a
// starting point; the school can edit every row.
const SENIOR_SECONDARY_RANGES: DefaultGradeRange[] = [
  { grade: "A1", min_score: 75, max_score: 100, remark: "Excellent" },
  { grade: "B2", min_score: 70, max_score: 74, remark: "Very good" },
  { grade: "B3", min_score: 65, max_score: 69, remark: "Good" },
  { grade: "C4", min_score: 60, max_score: 64, remark: "Credit" },
  { grade: "C5", min_score: 55, max_score: 59, remark: "Credit" },
  { grade: "C6", min_score: 50, max_score: 54, remark: "Credit" },
  { grade: "D7", min_score: 45, max_score: 49, remark: "Pass" },
  { grade: "E8", min_score: 40, max_score: 44, remark: "Pass" },
  { grade: "F9", min_score: 0, max_score: 39, remark: "Fail" },
];

const DEFAULT_RANGES: DefaultGradeRange[] = [
  { grade: "A", min_score: 70, max_score: 100, remark: "Excellent" },
  { grade: "B", min_score: 60, max_score: 69, remark: "Good" },
  { grade: "C", min_score: 50, max_score: 59, remark: "Credit" },
  { grade: "D", min_score: 40, max_score: 49, remark: "Pass" },
  { grade: "F", min_score: 0, max_score: 39, remark: "Fail" },
];

export function getDefaultGradeRanges(level: SchoolLevelValue): DefaultGradeRange[] {
  return level === "senior_secondary" ? SENIOR_SECONDARY_RANGES : DEFAULT_RANGES;
}
