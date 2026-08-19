"use client";

import type { StudentListItem } from "@/features/students/types";

import type { BroadsheetColumn, BroadsheetGridRow } from "../hooks/use-broadsheet";
import type { StudentResultRemark } from "../types";
import { RemarkField } from "./remark-field";
import { StudentResultContext } from "./student-result-context";

interface Props {
  student: StudentListItem;
  remark: StudentResultRemark | undefined;
  isSaving: boolean;
  onSave: (text: string) => void;
  resultRow: BroadsheetGridRow | undefined;
  resultColumns: BroadsheetColumn[];
}

// One student's result, then both remarks about it.
//
// The scores come first because that's what the head is remarking on — writing
// "a commendable result" without seeing the result is guesswork. The form
// teacher's remark follows, read-only: the head writes theirs *in response* to
// it, and making them look it up on another screen is how you get two comments
// that contradict each other. Attributed for the same reason — knowing which
// teacher wrote it is part of judging it.
export function PrincipalRemarkRow({
  student,
  remark,
  isSaving,
  onSave,
  resultRow,
  resultColumns,
}: Props) {
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
        <div className="mt-1">
          <StudentResultContext row={resultRow} columns={resultColumns} />
        </div>
      </div>

      {/* Labelled with the same words the report card uses for each section, so
          the head is reading the two in the shape they'll print. */}
      <RemarkField
        label="Class teacher's remark"
        placeholder=""
        saved={remark?.class_teacher_remark}
        savedByName={teacherName}
        savedAt={remark?.class_teacher_remark_at}
        isPending={false}
        onSave={() => {}}
        readOnly
      />

      <RemarkField
        label="Principal's remark"
        hint="Prints below the class teacher's, as its own section on the report card."
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
