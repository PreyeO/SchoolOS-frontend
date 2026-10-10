import type { StudentListItem } from "../types";
import { StudentTableRow } from "./student-table-row";

// Row selection for the directory's bulk status change. Optional and off by
// default: a teacher's /my-students roster reuses this table and has no bulk
// action to offer.
export interface StudentSelection {
  selected: ReadonlySet<string>;
  onToggle: (student: StudentListItem) => void;
  onToggleAll: (students: StudentListItem[], select: boolean) => void;
}

export function StudentsTable({
  students,
  basePath,
  selection,
}: {
  students: StudentListItem[];
  // Passed through to each row — see StudentTableRow.
  basePath?: string;
  selection?: StudentSelection;
}) {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-n-200 bg-white py-10 text-center">
        <p className="text-sm text-n-400 italic">No students match.</p>
      </div>
    );
  }

  const allSelected = !!selection && students.every((s) => selection.selected.has(s.id));

  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            {selection && (
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  aria-label="Select every student on this page"
                  checked={allSelected}
                  onChange={(e) => selection.onToggleAll(students, e.target.checked)}
                />
              </th>
            )}
            <th className="px-3 py-2.5 font-medium">Name</th>
            <th className="px-3 py-2.5 font-medium">Admission no.</th>
            <th className="px-3 py-2.5 font-medium">Gender</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <StudentTableRow
              key={student.id}
              student={student}
              basePath={basePath}
              isSelected={selection ? selection.selected.has(student.id) : undefined}
              onToggle={selection ? () => selection.onToggle(student) : undefined}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
