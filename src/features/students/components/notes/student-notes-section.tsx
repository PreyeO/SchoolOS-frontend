"use client";

import { useState } from "react";
import { NotebookPen, Plus } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

import {
  useCreateStudentNote,
  useNotePermissions,
  useStudentNotes,
} from "../../hooks/use-student-notes";
import { NoteComposer } from "./note-composer";
import { NoteRow } from "./note-row";

// Teachers' running notes on a student.
//
// The reason this exists is handover: notes persist across class, session and
// teacher changes, so next year's teacher inherits context instead of relying
// on someone remembering to pass it on. That's why the list is a chronology
// with author and date on every entry, and why an old note shows the class the
// student was in when it was written.
//
// Staff-only, and structurally so — the endpoint returns an empty list to
// parents and students rather than a 403, and this section only renders on
// screens they can't reach. If it's ever reused somewhere family-facing, that
// empty list would read as "no notes" rather than "not for you".
export function StudentNotesSection({ studentId }: { studentId: string }) {
  const [composing, setComposing] = useState(false);
  const { data: notes, isPending, isError, error } = useStudentNotes(studentId);
  const { canWrite } = useNotePermissions();
  const create = useCreateStudentNote(studentId);

  return (
    <div className="rounded-xl border border-n-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <NotebookPen className="size-4 text-n-400" />
          Teacher notes
        </h2>
        {/* Only a teacher may write — an admin without a teacher profile gets a
            403 from the endpoint, so the button is absent rather than failing. */}
        {canWrite && !composing && (
          <Button type="button" variant="outline" size="sm" onClick={() => setComposing(true)}>
            <Plus className="size-3.5 mr-1" />
            Add note
          </Button>
        )}
      </div>

      {composing && (
        <div className="mt-3">
          <NoteComposer
            placeholder="What should the next teacher know? Behaviour patterns, ongoing concerns, what works."
            submitLabel="Add note"
            isPending={create.isPending}
            onCancel={() => setComposing(false)}
            onSubmit={(note) => create.mutate(note, { onSuccess: () => setComposing(false) })}
          />
        </div>
      )}

      {isPending ? (
        <p className="mt-3 text-sm text-n-400" role="status">
          Loading notes…
        </p>
      ) : isError ? (
        <div className="mt-3">
          <ErrorState error={error} resourceLabel="these notes" />
        </div>
      ) : notes.length === 0 ? (
        !composing && (
          <p className="mt-3 text-sm text-n-400 italic">
            {canWrite
              ? "No notes yet. Anything you record here follows this student to their next class and teacher."
              : "No notes yet. Teachers can record context here about this student."}
          </p>
        )
      ) : (
        <ul className="mt-1 divide-y divide-n-100">
          {notes.map((note) => (
            <NoteRow key={note.id} note={note} />
          ))}
        </ul>
      )}
    </div>
  );
}
