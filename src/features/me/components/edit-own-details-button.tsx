"use client";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditTeacherDialog } from "@/features/staff/components/edit-teacher-dialog";
import { teacherEditInitial } from "@/features/staff/components/teacher-edit-button";

import type { MeResponse } from "../types";

// Self-service name and phone, for anyone holding the teacher persona.
//
// It hangs off the teacher profile because that's the only self-update route
// the backend has: PATCH /teachers/:id/ lets a teacher write their own User
// fields (CanEditTeacherProfile checks the membership, not the active
// persona, so an admin who also teaches can use it too). Admins, parents and
// students have no equivalent, so for them this renders nothing.
export function EditOwnDetailsButton({ me }: { me: MeResponse }) {
  if (!me.teacher) return null;

  return (
    <EditTeacherDialog
      teacherId={me.teacher.id}
      // teacher_type isn't on /me and self mode never sends it (it's a
      // staff-record field — sending it would 403), so any valid value works.
      initial={teacherEditInitial({ user: me.user, teacher_type: "class" })}
      mode="self"
      trigger={
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
          <Pencil className="mr-1 size-3.5" /> Edit
        </Button>
      }
    />
  );
}
