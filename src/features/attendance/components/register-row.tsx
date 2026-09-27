"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { cn } from "@/lib/utils";
import { studentPhoto } from "@/features/students/lib/student-photo";
import type { StudentListItem } from "@/features/students/types";

import type { DraftEntry } from "../hooks/use-register-draft";
import type { AttendanceRecord, AttendanceStatus } from "../types";
import { StatusToggle } from "./status-toggle";

interface Props {
  student: StudentListItem;
  entry: DraftEntry | undefined;
  savedRecord: AttendanceRecord | undefined;
  canMark: boolean;
  onStatus: (status: AttendanceStatus) => void;
  onNote: (note: string) => void;
}

export function RegisterRow({ student, entry, savedRecord, canMark, onStatus, onNote }: Props) {
  const [noteOpen, setNoteOpen] = useState(false);
  const { user } = student;
  const name = `${user.first_name} ${user.last_name}`;
  const showNote = noteOpen || !!entry?.note;

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2">
      <PersonAvatar
        firstName={user.first_name}
        lastName={user.last_name}
        photo={studentPhoto(student)}
        className="size-8"
      />

      {/* Wraps rather than truncating on a phone. With the four-way toggle beside
          it (~150px), the avatar and the note button, the name was left ~40px
          and read "Ifeanyi O…". The toggle now takes its own line below (see the
          wrapper), which leaves the name a whole line. */}
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-ink sm:truncate">{name}</span>
        <span className="block font-mono text-[11px] text-n-400 sm:truncate">{student.admission_number}</span>
      </span>

      {canMark && entry && (
        <button
          type="button"
          onClick={() => setNoteOpen((v) => !v)}
          aria-label={`${entry.note ? "Edit" : "Add"} note for ${name}`}
          aria-expanded={showNote}
          className={cn(
            "cursor-pointer rounded-md p-2.5 transition-colors sm:p-1.5",
            entry.note ? "text-primary" : "text-n-400 hover:text-n-600",
          )}
        >
          <MessageSquarePlus className="size-4" />
        </button>
      )}

      {/* Own line below sm, indented (pl-11 = avatar 32px + the 12px gap) to sit
          under the name, the same indent the note field below uses. From sm up
          it rejoins the row. The toggle itself is untouched — same segments,
          same touch targets. */}
      <div className="basis-full pl-11 sm:basis-auto sm:pl-0">
        <StatusToggle
          value={entry?.status ?? null}
          onChange={onStatus}
          disabled={!canMark}
          studentName={name}
        />
      </div>

      {showNote && canMark && (
        <div className="w-full pl-11">
          <Input
            value={entry?.note ?? ""}
            onChange={(e) => onNote(e.target.value)}
            placeholder="Reason or note (optional)"
            maxLength={255}
            aria-label={`Note for ${name}`}
            className="h-8 text-xs"
          />
        </div>
      )}

      {/* Read-only viewers still need the note and who recorded it — that's the
          whole value of the view for an admin checking a disputed absence. */}
      {!canMark && (savedRecord?.note || savedRecord?.marked_by) && (
        <div className="w-full pl-11 text-xs text-n-400">
          {savedRecord.note && <span className="text-n-500">{savedRecord.note}</span>}
          {savedRecord.note && savedRecord.marked_by && <span> · </span>}
          {savedRecord.marked_by && (
            <span>
              Marked by {savedRecord.marked_by.first_name} {savedRecord.marked_by.last_name}
            </span>
          )}
        </div>
      )}
    </li>
  );
}
