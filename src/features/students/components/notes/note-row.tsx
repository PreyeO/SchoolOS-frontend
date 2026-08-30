"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import {
  useDeleteStudentNote,
  useNotePermissions,
  useUpdateStudentNote,
} from "../../hooks/use-student-notes";
import type { StudentNote } from "../../types-notes";
import { NoteComposer } from "./note-composer";

function nameParts(full: string): [string, string] {
  const [first = full, ...rest] = full.split(" ");
  return [first, rest.join(" ")];
}

export function NoteRow({ note }: { note: StudentNote }) {
  const [editing, setEditing] = useState(false);
  const { canEdit, canDelete, isMine } = useNotePermissions();
  const update = useUpdateStudentNote();
  const remove = useDeleteStudentNote();

  const [first, last] = nameParts(note.author.name);
  const edited = note.updated_at !== note.created_at;

  return (
    <li className="flex gap-3 py-3">
      <PersonAvatar firstName={first} lastName={last} className="mt-0.5 size-8 shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-ink">{note.author.name}</span>
          {isMine(note) && <span className="text-[11px] text-n-400">You</span>}
          <span className="text-xs text-n-400">{formatTimestamp(note.created_at)}</span>
          {edited && <span className="text-[11px] text-n-400">· edited</span>}
          {/* The class the student was in when this was written, not now. On an
              older note that difference is the point — it says which year and
              which teacher's vantage the observation came from. */}
          {note.class_name && (
            <span className="text-[11px] text-n-400">
              · {note.arm_name || note.class_name}
            </span>
          )}
        </div>

        {editing ? (
          <div className="mt-2">
            <NoteComposer
              initialValue={note.note}
              placeholder="Update this note…"
              submitLabel="Save"
              isPending={update.isPending}
              onCancel={() => setEditing(false)}
              onSubmit={(text) =>
                update.mutate({ id: note.id, note: text }, { onSuccess: () => setEditing(false) })
              }
            />
          </div>
        ) : (
          // whitespace-pre-wrap: the backend stores plain text, so a teacher's
          // line breaks are the only structure a note has.
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-n-600">
            {note.note}
          </p>
        )}
      </div>

      {!editing && (canEdit(note) || canDelete(note)) && (
        <span className="flex shrink-0 items-start gap-0.5">
          {canEdit(note) && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Edit note"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          {canDelete(note) && (
            <ConfirmDeleteDialog
              trigger={
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Delete note">
                  <Trash2 className="size-3.5" />
                </Button>
              }
              title="Delete this note?"
              description={
                isMine(note)
                  ? "This removes your note permanently."
                  : `This removes ${note.author.name}'s note permanently.`
              }
              isPending={remove.isPending}
              onConfirm={() => remove.mutate(note.id)}
            />
          )}
        </span>
      )}
    </li>
  );
}
