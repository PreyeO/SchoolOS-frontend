import type { SchoolLevelValue } from "@/data/school-levels";
import type { SubjectResponse } from "@/features/onboarding/types";
import { SubjectTableRow } from "./subject-table-row";

export function SubjectsTable({ subjects, schoolLevels }: { subjects: SubjectResponse[]; schoolLevels: SchoolLevelValue[] }) {
  if (subjects.length === 0) {
    return (
      <div className="rounded-xl border border-n-200 bg-white py-10 text-center">
        <p className="text-sm text-n-400 italic">No subjects match.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2.5 font-medium">Subject</th>
            <th className="px-3 py-2.5 font-medium">Level</th>
            <th className="px-3 py-2.5 font-medium">Type</th>
            <th className="px-3 py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s) => (
            <SubjectTableRow key={s.id} subject={s} schoolLevels={schoolLevels} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
