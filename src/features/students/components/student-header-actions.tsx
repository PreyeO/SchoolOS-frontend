"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";

import { useDeleteStudent } from "../hooks/use-student-lifecycle";
import { useCanEditStudent } from "../hooks/use-update-student";
import { isTerminalStatus } from "../lib/enrollment-status";
import { isSyntheticEmail } from "../lib/is-synthetic-email";
import type { StudentDetail } from "../types";
import { ChangeStatusDialog } from "./change-status-dialog";
import { EditNameDialog } from "./edit-name-dialog";
import { ReissuePasswordDialog } from "./reissue-password-dialog";

// The student header's account-level actions. Two different gates:
//   - Correct name rides the profile PATCH, so it follows CanEditStudentProfile:
//     an admin with edit_students OR any teacher (useCanEditStudent).
//   - Reissue and status need edit_students, delete needs delete_students.
//     HasSchoolPermission hard-requires is_admin, so a teacher would 403 on
//     each and they're hidden instead.
export function StudentHeaderActions({ student }: { student: StudentDetail }) {
  const router = useRouter();
  const canEditProfile = useCanEditStudent();
  const canEdit = useHasSchoolPermission("edit_students");
  const canDelete = useHasSchoolPermission("delete_students");
  const remove = useDeleteStudent(student.id);
  const name = `${student.user.first_name} ${student.user.last_name}`;
  // A terminal status is one-way, so the button would open onto an empty
  // picker. Shown only while there's somewhere to go.
  const canChangeStatus = canEdit && !isTerminalStatus(student.enrollment_status);

  if (!canEditProfile && !canEdit && !canDelete) return null;

  return (
    // A fragment: ProfileHeaderCard owns the wrapping row.
    <>
      {canEdit && isSyntheticEmail(student.user.email) && <ReissuePasswordDialog studentId={student.id} />}
      {canEditProfile && <EditNameDialog student={student} />}
      {canChangeStatus && (
        <ChangeStatusDialog
          subject={name}
          students={[{ id: student.id, status: student.enrollment_status }]}
          trigger={
            <Button type="button" variant="outline" size="sm">
              Change status
            </Button>
          }
        />
      )}
      {canDelete && (
        <ConfirmDeleteDialog
          trigger={
            <Button type="button" variant="ghost" size="sm" className="text-destructive">
              <Trash2 className="size-3.5" /> Delete
            </Button>
          }
          title={`Delete ${name}?`}
          // Delete is for a bad invite or import row only. The backend refuses
          // anyone with history, and its message says to use a status instead.
          description="Only for a student added by mistake. Anyone who attended — with scores, attendance, notes or fees on record — can't be deleted; change their status to Withdrawn or Transferred instead. This can't be undone."
          isPending={remove.isPending}
          onConfirm={() => remove.mutate(undefined, { onSuccess: () => router.push("/students") })}
        />
      )}
    </>
  );
}
