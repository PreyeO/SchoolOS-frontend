import type { SchoolLevelValue } from "./school-levels";

export const LEVEL_SUBJECTS: Partial<Record<SchoolLevelValue, string[]>> = {
  creche: [
    "Language Arts",
    "Numeracy",
    "Creative Arts",
    "Motor Skills Development",
    "Music & Rhymes",
    "Social Skills",
  ],
  nursery: [
    "Language Arts",
    "Numeracy",
    "Creative Arts & Crafts",
    "Music & Rhymes",
    "Social Studies",
    "Physical Education",
  ],
  primary: [
    "English Studies",
    "Mathematics",
    "Basic Science & Technology",
    "Social Studies",
    "National Values Education (NVE)",
    "Cultural & Creative Arts (CCA)",
    "Computer Studies / ICT",
    "Physical & Health Education (PHE)",
    "Religious & Moral Instruction",
    "Handwriting / Verbal Reasoning",
  ],
  junior_secondary: [
    "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "French Language",
    "Cultural & Creative Arts",
    "Computer Studies",
    "Physical & Health Education",
    "Agricultural Science",
    "Home Economics",
    "Christian Religious Knowledge (CRK)",
    "Islamic Religious Knowledge (IRK)",
  ],
  senior_secondary: [
    "Use of English",
    "Mathematics",
    "Civic Education",
    "Physics",
    "Chemistry",
    "Biology",
    "Further Mathematics",
    "Agricultural Science",
    "Computer Studies",
    "Literature in English",
    "Government",
    "History",
    "Geography",
    "CRK / IRK",
    "Financial Accounting",
    "Economics",
    "Commerce",
    "Marketing",
  ],
};

export interface SuggestedSubject {
  name: string;
  level: SchoolLevelValue;
  is_core: boolean;
}

// One entry per (level, subject) — subjects are tracked per level, so a subject
// taught at several levels yields several entries. NERDC suggestions default to core.
export function getSuggestedSubjects(levels: SchoolLevelValue[]): SuggestedSubject[] {
  const result: SuggestedSubject[] = [];
  for (const level of levels) {
    for (const name of LEVEL_SUBJECTS[level] ?? []) {
      result.push({ name, level, is_core: true });
    }
  }
  return result;
}
