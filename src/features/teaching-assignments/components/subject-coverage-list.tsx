"use client";

import type { SubjectResponse } from "@/features/onboarding/types";

import type { SubjectAssignment } from "../types";
import { SubjectCoverageRow } from "./subject-coverage-row";

interface Props {
  loading: boolean;
  armLabel: string;
  // Every subject defined at this arm's level — distinct from what the arm
  // actually takes, and the difference is what the two empty states below
  // tell apart.
  levelSubjects: SubjectResponse[];
  offeredSubjects: SubjectResponse[];
  bySubject: Map<string, SubjectAssignment[]>;
  offeringIdBySubject: Map<string, string>;
  onAssign: (subject: SubjectResponse) => void;
}

// Who teaches what in this arm, one row per offered subject.
//
// The two empty states are deliberately different questions. No subjects at the
// level means the school hasn't defined them at all; none offered means this
// particular arm doesn't take any yet — and since an offering is a prerequisite
// of an assignment, that second case has nothing to assign against rather than
// being broken.
export function SubjectCoverageList({
  loading,
  armLabel,
  levelSubjects,
  offeredSubjects,
  bySubject,
  offeringIdBySubject,
  onAssign,
}: Props) {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-5">
      {loading ? (
        <p className="text-sm text-n-400" role="status">Loading subjects…</p>
      ) : levelSubjects.length === 0 ? (
        <p className="text-sm text-n-400 italic">
          No subjects defined for this level yet — add them in Subjects first.
        </p>
      ) : offeredSubjects.length === 0 ? (
        <div className="py-6 text-center">
          {/* One template literal rather than `{label} takes no…`: the arm name
              butting straight up against the next word was reported here, and
              building the sentence in JS puts the spacing beyond the reach of
              any JSX whitespace handling. */}
          <p className="text-sm font-medium text-ink">
            {`No subjects added to ${armLabel || "this class"} yet`}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-n-500">
            Add the subjects this class takes before assigning teachers to them. Arms under the
            same class can take different subjects.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-n-100">
          {offeredSubjects.map((subject) => (
            <SubjectCoverageRow
              key={subject.id}
              subject={subject}
              assignments={bySubject.get(subject.id) ?? []}
              armLabel={armLabel}
              offeringId={offeringIdBySubject.get(subject.id)}
              onAssign={() => onAssign(subject)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
