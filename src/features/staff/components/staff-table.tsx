import type { TeacherListItem } from "../types";
import { StaffTableRow } from "./staff-table-row";

export function StaffTable({ teachers }: { teachers: TeacherListItem[] }) {
  if (teachers.length === 0) {
    return (
      <div className="rounded-xl border border-n-200 bg-white py-10 text-center">
        <p className="text-sm text-n-400 italic">No staff match.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2.5 font-medium">Name</th>
            <th className="px-3 py-2.5 font-medium">Email</th>
            <th className="px-3 py-2.5 font-medium">Employee ID</th>
            <th className="px-3 py-2.5 font-medium">Type</th>
            <th className="px-3 py-2.5 font-medium">Specialization</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <StaffTableRow key={teacher.id} teacher={teacher} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
