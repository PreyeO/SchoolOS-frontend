import type { StudentDetail, StudentListItem } from "../types";

// Which photo to show for a student, out of the TWO the API returns.
//
// A student record carries both `photo` (StudentProfile.photo_key) and
// `user.photo` (User.photo_key). They are different columns, and only the first
// is writable: `PATCH /api/students/{id}/` whitelists `photo_key`, while
// `User.photo_key` has NO attach endpoint anywhere in the API — the presigned
// endpoint accepts a `user-photos` prefix, but nothing consumes the key.
//
// This matters because the avatars read `user.photo` before student photos were
// uploadable, when both were always null and the choice was invisible. Now an
// admin can upload one, and reading the wrong field would save it successfully
// and never show it — the upload appearing to do nothing.
//
// Prefers the student's own and falls back to the user's, so this stays correct
// if a User.photo write path ever lands.
export function studentPhoto(student: StudentDetail | StudentListItem): string | null {
  return student.photo ?? student.user.photo ?? null;
}
