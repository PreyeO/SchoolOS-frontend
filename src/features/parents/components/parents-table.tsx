import type { ParentListItem } from "../types";
import { ParentTableRow } from "./parent-table-row";

export function ParentsTable({ parents }: { parents: ParentListItem[] }) {
  if (parents.length === 0) {
    return (
      <div className="rounded-xl border border-n-200 bg-white py-10 text-center">
        <p className="text-sm text-n-400 italic">No parents match.</p>
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
            <th className="px-3 py-2.5 font-medium">Phone</th>
            <th className="px-3 py-2.5 font-medium">Occupation</th>
          </tr>
        </thead>
        <tbody>
          {parents.map((parent) => (
            <ParentTableRow key={parent.id} parent={parent} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
