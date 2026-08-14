import type { TeacherType } from "../types";

// "Form teacher" is the term everywhere in the UI. The API values stay `class` /
// `subject` / `both` — this is the one place the two vocabularies meet, so a
// wire value never has to be renamed to change what a user reads.
const LABELS: Record<TeacherType, string> = {
  class: "Form teacher",
  subject: "Subject teacher",
  both: "Form & subject",
};

export function teacherTypeLabel(type: TeacherType): string {
  return LABELS[type];
}

// Longer-form copy for pickers where someone is choosing a type for the first
// time and the label alone doesn't say what they're signing the person up for.
const DESCRIPTIONS: Record<TeacherType, string> = {
  class: "In charge of a class/arm: takes attendance and handles that class's report cards.",
  subject: "Teaches a subject (or subjects) across one or more classes.",
  both: "Runs a class as form teacher and also teaches subjects.",
};

export function teacherTypeDescription(type: TeacherType): string {
  return DESCRIPTIONS[type];
}
