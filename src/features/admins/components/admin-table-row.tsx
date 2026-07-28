import Link from "next/link";

import { PersonAvatar } from "@/components/shared/person-avatar";
import type { AdminListItem } from "../types";

export function AdminTableRow({ admin }: { admin: AdminListItem }) {
  const { user } = admin;

  return (
    <tr className="border-b border-n-100 last:border-0">
      <td className="px-3 py-2.5">
        <Link href={`/admins/${admin.id}`} className="flex items-center gap-2.5 hover:underline">
          <PersonAvatar firstName={user.first_name} lastName={user.last_name} photo={user.photo} className="size-8" />
          <span className="text-sm font-medium text-ink">
            {user.first_name} {user.last_name}
          </span>
        </Link>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{user.email}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm">
        {admin.school_admin_role ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {admin.school_admin_role.name}
          </span>
        ) : (
          <span className="text-xs text-n-400 italic">No role</span>
        )}
      </td>
    </tr>
  );
}
