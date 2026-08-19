"use client";

import type { StudentListItem } from "@/features/students/types";

import type { BroadsheetColumn, BroadsheetGridRow } from "../hooks/use-broadsheet";
import type { BehavioralTrait, StudentResultRemark } from "../types";
import { RatingScale } from "./rating-scale";
import { RemarkField } from "./remark-field";
import { StudentResultContext } from "./student-result-context";

interface Props {
  student: StudentListItem;
  traits: BehavioralTrait[];
  draft: Record<string, number>;
  onRate: (key: string, rating: number) => void;
  remark: StudentResultRemark | undefined;
  isSavingRemark: boolean;
  onSaveRemark: (text: string) => void;
  resultRow: BroadsheetGridRow | undefined;
  resultColumns: BroadsheetColumn[];
}

// Everything the form teacher owns on a report card for one child: what they
// scored, how they conducted themselves, and the remark that comments on both.
//
// One student per block rather than a students x traits grid — a grid of
// five-button scales is unreadable on a phone, and rating is done per child:
// you think about Ada, then move on.
//
// The scores sit above the ratings on purpose. The remark a teacher writes is
// usually about performance *and* conduct ("hardworking, but should be more
// punctual"), so both need to be in view before the field is reached.
export function BehaviourStudentBlock({
  student,
  traits,
  draft,
  onRate,
  remark,
  isSavingRemark,
  onSaveRemark,
  resultRow,
  resultColumns,
}: Props) {
  return (
    <li className="px-5 py-3.5">
      <p className="text-sm font-medium text-ink">
        {student.user.first_name} {student.user.last_name}
      </p>
      <p className="font-mono text-[11px] text-n-400">{student.admission_number}</p>

      <div className="mt-2.5">
        <StudentResultContext row={resultRow} columns={resultColumns} />
      </div>

      <ul className="mt-3 space-y-2 border-t border-n-100 pt-3">
        {traits.map((trait) => {
          const key = `${student.id}|${trait.id}`;
          return (
            <li
              key={trait.id}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5"
            >
              <span className="min-w-0 flex-1 truncate text-sm text-n-600">{trait.name}</span>
              <RatingScale
                label={`${trait.name} for ${student.user.first_name}`}
                value={draft[key]}
                onChange={(rating) => onRate(key, rating)}
              />
            </li>
          );
        })}
      </ul>

      {/* A full rule rather than the hairline used between results and ratings.
          The remark is not a footnote to the trait scales above it — it's a
          separate report card section (ReportCardSection.CLASS_TEACHER_REMARK),
          togglable independently of the behaviour ones, so a school can print
          it with the ratings switched off entirely. Under a vague label and a
          thin divider it read as "comment on their conduct", which is what it
          is not.

          Saved on its own, not with the ratings batch — see RemarkField:
          remarks have no marked_at and so can't be queued or replayed the way
          ratings can. */}
      <div className="mt-4 border-t-2 border-n-200 pt-3">
        <RemarkField
          label="Class teacher's remark"
          hint="Your overall comment on the term — prints on the report card under their results."
          placeholder="e.g. A steady term. Ada should speak up more in class."
          saved={remark?.class_teacher_remark}
          savedByName={null}
          savedAt={remark?.class_teacher_remark_at}
          isPending={isSavingRemark}
          onSave={onSaveRemark}
        />
      </div>
    </li>
  );
}
