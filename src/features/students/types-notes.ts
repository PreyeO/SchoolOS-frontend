import type { StudentListItem } from "./types";

// A teacher's free-form note about a student (academic.StudentNote).
//
// The point of the model is continuity: notes persist across class, session and
// teacher changes, so next year's teacher inherits context — behaviour
// patterns, ongoing concerns, useful background — instead of relying on
// informal handover.
export interface StudentNoteAuthor {
  // The TeacherProfile id — compare against /me.teacher.id to decide whether
  // the caller may edit. NULL once that teacher's profile has been removed
  // (staff offboarding), at which point nobody can edit the note and only an
  // admin can delete it.
  id: string | null;
  // Snapshotted at write time, so a note stays attributable even after its
  // author's profile is gone. Always present, even when id is null.
  name: string;
}

export interface StudentNote {
  id: string;
  student: StudentListItem;
  author: StudentNoteAuthor;
  // The student's class WHEN THE NOTE WAS WRITTEN, not now — contextual only.
  // Both null if the student had no current enrolment at that moment, which
  // doesn't block writing a note.
  class_name: string | null;
  arm_name: string | null;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentNotePayload {
  student_id: string;
  note: string;
}
