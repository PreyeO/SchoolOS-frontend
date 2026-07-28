import type { AdminListItem } from "../types";
import { AdminTableRow } from "./admin-table-row";

export function AdminsTable({ admins }: { admins: AdminListItem[] }) {
  if (admins.length === 0) {
    return (
      <div className="rounded-xl border border-n-200 bg-white py-10 text-center">
        <p className="text-sm text-n-400 italic">No admins match.</p>
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
            <th className="px-3 py-2.5 font-medium">Role</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <AdminTableRow key={admin.id} admin={admin} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
