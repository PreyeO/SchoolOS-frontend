"use client";

import { NotebookPen } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";

import {
  useCreateStudentNote,
  useNotePermissions,
  useStudentNotes,
} from "../../hooks/use-student-notes";
import { NoteComposer } from "./note-composer";
import { NoteRow } from "./note-row";

// One running note per student, not a message board.
//
// Visible only to the form teacher currently responsible for this student's
// class, plus admins — see the reasoning in use-student-notes.ts. Everyone
// else on this page (a subject teacher, say) sees nothing here at all, not an
// empty state: the section itself is the thing being hidden, not its content.
//
// The point is handover between consecutive form teachers of the same arm —
// "parents pick him up at 4pm", "takes medication at 2pm" — so it reads as one
// continuous box a teacher adds to, not a chronology of separate messages:
// exactly one composer, always visible for whoever may write, appending
// directly under it rather than behind an "Add note" click. Entries still
// carry an author and date each (the backend has no other way to record who
// said what when, and that provenance is real value for a successor reading
// it two years later) but are styled as lines in one log, not as individually
// bordered cards.
export function StudentNotesSection({
  studentId,
  currentClassArmId,
}: {
  studentId: string;
  currentClassArmId: string | null;
}) {
  const { data: notes, isPending, isError, error } = useStudentNotes(studentId);
  const permissions = useNotePermissions(currentClassArmId);
  const { canView, canWrite } = permissions;
  const create = useCreateStudentNote(studentId);

  if (!canView) return null;

  return (
    <div className="rounded-xl border border-n-200 bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <NotebookPen className="size-4 text-n-400" />
        Student note
      </h2>

      {canWrite && (
        <div className="mt-3">
          <NoteComposer
            placeholder="What should the next form teacher know? Routines, ongoing concerns, what works — e.g. picked up at 4pm, medication at 2pm."
            submitLabel="Add"
            isPending={create.isPending}
            onSubmit={(note) => create.mutate(note)}
          />
        </div>
      )}

      {isPending ? (
        <p className="mt-3 text-sm text-n-400" role="status">
          Loading…
        </p>
      ) : isError ? (
        <div className="mt-3">
          <ErrorState error={error} resourceLabel="this note" />
        </div>
      ) : notes.length === 0 ? (
        <p className="mt-3 text-sm text-n-400 italic">
          {canWrite
            ? "Nothing recorded yet. What you add here follows this student to their next form teacher."
            : "Nothing recorded yet."}
        </p>
      ) : (
        <ul className="mt-3 space-y-3 divide-y divide-n-100">
          {notes.map((note) => (
            <NoteRow key={note.id} note={note} permissions={permissions} />
          ))}
        </ul>
      )}
    </div>
  );
}
