"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useMe } from "@/features/me/hooks/use-me";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { useIsSchoolAdmin } from "@/lib/auth/use-personas";

import {
  createStudentNote,
  deleteStudentNote,
  getStudentNotes,
  updateStudentNote,
} from "../api/notes-api";
import type { StudentNote } from "../types-notes";

const NOTES_KEY = ["students", "notes"];

export function useStudentNotes(studentId: string) {
  return useQuery({
    queryKey: [...NOTES_KEY, studentId],
    queryFn: () => getStudentNotes(studentId),
  });
}

function useNotesMutation<TArgs>(
  mutationFn: (args: TArgs) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      toast.success(successMessage);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateStudentNote(studentId: string) {
  return useNotesMutation(
    (note: string) => createStudentNote({ student_id: studentId, note }),
    "Note added",
  );
}

export function useUpdateStudentNote() {
  return useNotesMutation(
    ({ id, note }: { id: string; note: string }) => updateStudentNote(id, note),
    "Note updated",
  );
}

export function useDeleteStudentNote() {
  return useNotesMutation((id: string) => deleteStudentNote(id), "Note deleted");
}

// Who may see and do what with a student's notes.
//
// Narrowed 2026-09-03 from "any teacher" to "the form teacher of this
// student's CURRENT class" — deliberately, per the ask: this is a handover
// tool between consecutive form teachers of the same arm ("parents pick him up
// at 4pm", "takes medication at 2pm"), not a general staffroom notice board.
// The backend still permits any teacher to read/write (StudentNoteService
// intentionally isn't restricted that way — see its docstring), so this is a
// frontend-only narrowing: the section simply doesn't render for a teacher who
// isn't the current form teacher, rather than the API refusing them.
//
// Admins keep view access — they already see everything else on this page,
// already hold delete rights over any note (edit_students), and are the only
// backstop if something needs review after the writing teacher has moved on.
// This is a judgment call, not something the user specified either way; flag
// it if admins shouldn't see this.
//
// currentClassArmId is the student's OWN current class_arm_id
// (student.current_class?.class_arm_id) — not the note's historical one, which
// can differ after a transfer or promotion and is deliberately not what gates
// access here.
//
// `author.id` is null once that teacher's profile has been removed, at which
// point nobody can edit the note and only an admin can clear it — hence the
// explicit null check rather than comparing a possibly-undefined id.
export function useNotePermissions(currentClassArmId: string | null) {
  const { data: me } = useMe();
  const isAdmin = useIsSchoolAdmin();
  const canDeleteAny = useHasSchoolPermission("edit_students");
  const myTeacherId = me?.teacher?.id;
  const isFormTeacherHere =
    !!currentClassArmId && !!me?.teacher?.class_arms.some((arm) => arm.id === currentClassArmId);

  return {
    canView: isAdmin || isFormTeacherHere,
    canWrite: isFormTeacherHere,
    isMine: (note: StudentNote) => !!myTeacherId && note.author.id === myTeacherId,
    canEdit: (note: StudentNote) => !!myTeacherId && note.author.id === myTeacherId,
    canDelete: (note: StudentNote) =>
      canDeleteAny || (!!myTeacherId && note.author.id === myTeacherId),
  };
}
