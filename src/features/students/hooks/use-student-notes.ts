"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useMe } from "@/features/me/hooks/use-me";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { useIsTeacher } from "@/lib/auth/use-personas";

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

// Who may do what with a given note.
//
// Mirrors StudentNoteService rather than guessing: writing needs a teacher
// profile (an admin without one gets 403 — verified live), editing is the
// author's alone even against admins, and deleting is the author OR an admin
// holding edit_students.
//
// `author.id` is null once that teacher's profile has been removed, at which
// point nobody can edit the note and only an admin can clear it — hence the
// explicit null check rather than comparing a possibly-undefined id.
export function useNotePermissions() {
  const { data: me } = useMe();
  const isTeacher = useIsTeacher();
  const canDeleteAny = useHasSchoolPermission("edit_students");
  const myTeacherId = me?.teacher?.id;

  return {
    canWrite: isTeacher && !!myTeacherId,
    isMine: (note: StudentNote) => !!myTeacherId && note.author.id === myTeacherId,
    canEdit: (note: StudentNote) => !!myTeacherId && note.author.id === myTeacherId,
    canDelete: (note: StudentNote) =>
      canDeleteAny || (!!myTeacherId && note.author.id === myTeacherId),
  };
}
