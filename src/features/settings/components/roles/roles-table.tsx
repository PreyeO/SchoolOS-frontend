import type { Role } from "@/features/invitations/types";
import { RoleTableRow } from "./role-table-row";

export function RolesTable({ roles, catalog }: { roles: Role[]; catalog: string[] }) {
  if (roles.length === 0) {
    return (
      <div className="rounded-xl border border-n-200 bg-white py-10 text-center">
        <p className="text-sm text-n-400 italic">No roles yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2.5 font-medium">Role</th>
            <th className="px-3 py-2.5 font-medium">Permissions</th>
            <th className="px-3 py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <RoleTableRow key={role.id} role={role} catalog={catalog} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
