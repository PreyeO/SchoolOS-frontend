import type { StudentListItem } from "../types";
import { StudentTableRow } from "./student-table-row";

export function StudentsTable({ students }: { students: StudentListItem[] }) {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-n-200 bg-white py-10 text-center">
        <p className="text-sm text-n-400 italic">No students match.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2.5 font-medium">Name</th>
            <th className="px-3 py-2.5 font-medium">Admission no.</th>
            <th className="px-3 py-2.5 font-medium">Gender</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <StudentTableRow key={student.id} student={student} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
