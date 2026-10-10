import Link from "next/link";

import { PersonAvatar } from "@/components/shared/person-avatar";
import type { ParentListItem } from "../types";

export function ParentTableRow({ parent }: { parent: ParentListItem }) {
  const { user } = parent;

  return (
    <tr className="border-b border-n-100 last:border-0">
      <td className="px-3 py-2.5">
        {/* A former parent's detail 404s without ?is_parent=false — the
            route's ?former=1 asks for it. */}
        <Link
          href={`/parents/${parent.id}${parent.is_parent ? "" : "?former=1"}`}
          className="flex items-center gap-2.5 hover:underline"
        >
          <PersonAvatar firstName={user.first_name} lastName={user.last_name} photo={user.photo} className="size-8" />
          <span className="text-sm font-medium text-ink">
            {user.first_name} {user.last_name}
          </span>
        </Link>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{user.email}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{user.phone_number ?? "—"}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{parent.occupation ?? "—"}</td>
    </tr>
  );
}
