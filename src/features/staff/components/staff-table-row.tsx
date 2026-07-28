import Link from "next/link";

import { PersonAvatar } from "@/components/shared/person-avatar";
import { teacherTypeLabel } from "../lib/teacher-type-label";
import type { TeacherListItem } from "../types";

export function StaffTableRow({ teacher }: { teacher: TeacherListItem }) {
  const { user } = teacher;

  return (
    <tr className="border-b border-n-100 last:border-0">
      <td className="px-3 py-2.5">
        <Link href={`/staff/${teacher.id}`} className="flex items-center gap-2.5 hover:underline">
          <PersonAvatar firstName={user.first_name} lastName={user.last_name} photo={user.photo} className="size-8" />
          <span className="text-sm font-medium text-ink">
            {user.first_name} {user.last_name}
          </span>
        </Link>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{user.email}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{teacher.employee_id ?? "—"}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{teacherTypeLabel(teacher.teacher_type)}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{teacher.specialization ?? "—"}</td>
    </tr>
  );
}
