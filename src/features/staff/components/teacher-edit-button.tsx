"use client";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTeacherAssignments } from "@/features/teaching-assignments/hooks/use-teacher-assignments";

import type { TeacherEditValues } from "../schemas/teacher-edit-schema";
import type { TeacherDetail } from "../types";
import { EditTeacherDialog } from "./edit-teacher-dialog";

// The detail record → the form's values. null becomes "" (inputs need a
// string), which toTeacherPayload compares against, so an untouched blank
// field is never sent.
export function teacherEditInitial(teacher: {
  user: { first_name: string; last_name: string; phone_number: string | null };
  employee_id?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  teacher_type: TeacherDetail["teacher_type"];
}): TeacherEditValues {
  return {
    first_name: teacher.user.first_name,
    last_name: teacher.user.last_name,
    phone_number: teacher.user.phone_number ?? "",
    employee_id: teacher.employee_id ?? "",
    qualification: teacher.qualification ?? "",
    specialization: teacher.specialization ?? "",
    teacher_type: teacher.teacher_type,
  };
}

// Admin edit on /staff/:id. The assignment count comes from the same cached
// query the page's Subjects section already loads, so it costs no request.
export function TeacherEditButton({ teacher }: { teacher: TeacherDetail }) {
  const { data: assignments } = useTeacherAssignments(teacher.id);

  return (
    <EditTeacherDialog
      teacherId={teacher.id}
      initial={teacherEditInitial(teacher)}
      mode="admin"
      counts={{ subjectAssignments: assignments?.length ?? 0, classesLed: teacher.class_arms.length }}
      trigger={
        <Button type="button" variant="outline" size="sm">
          <Pencil className="size-3.5" /> Edit
        </Button>
      }
    />
  );
}
