"use client";

import type { StudentListItem } from "@/features/students/types";

import type { StudentResultRemark } from "../types";
import { RemarkField } from "./remark-field";

interface Props {
  student: StudentListItem;
  remark: StudentResultRemark | undefined;
  isSaving: boolean;
  onSave: (text: string) => void;
}

// One student's pair of remarks.
//
// The form teacher's is shown read-only rather than hidden: the head writes
// theirs *in response* to it, and making them look it up on another screen is
// how you get two comments that contradict each other. Attributed for the same
// reason — knowing which teacher wrote it is part of judging it.
export function PrincipalRemarkRow({ student, remark, isSaving, onSave }: Props) {
  const teacherName = remark?.class_teacher_remark_by
    ? `${remark.class_teacher_remark_by.first_name} ${remark.class_teacher_remark_by.last_name}`
    : null;

  return (
    <li className="space-y-3 px-5 py-4">
      <div>
        <p className="text-sm font-medium text-ink">
          {student.user.first_name} {student.user.last_name}
        </p>
        <p className="font-mono text-[11px] text-n-400">{student.admission_number}</p>
      </div>

      <RemarkField
        label="Form teacher's remark"
        placeholder=""
        saved={remark?.class_teacher_remark}
        savedByName={teacherName}
        savedAt={remark?.class_teacher_remark_at}
        isPending={false}
        onSave={() => {}}
        readOnly
      />

      <RemarkField
        label="Your remark"
        placeholder="e.g. A commendable result. Keep it up next term."
        saved={remark?.principal_remark}
        savedByName={null}
        savedAt={remark?.principal_remark_at}
        isPending={isSaving}
        onSave={onSave}
      />
    </li>
  );
}
