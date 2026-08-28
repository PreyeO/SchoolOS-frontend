import Link from "next/link";

import { PersonAvatar } from "@/components/shared/person-avatar";
import { genderLabel } from "../lib/labels";
import type { StudentListItem } from "../types";
import { EnrollmentStatusBadge } from "./enrollment-status-badge";

// basePath because the same row serves two routes: the admin directory at
// /students, and a teacher's own roster at /my-students. They can't share one
// path — /students is admin-only in the nav registry, which is what governs
// /students/<id> too.
export function StudentTableRow({
  student,
  basePath = "/students",
}: {
  student: StudentListItem;
  basePath?: string;
}) {
  const { user } = student;

  return (
    <tr className="border-b border-n-100 last:border-0">
      <td className="px-3 py-2.5">
        <Link href={`${basePath}/${student.id}`} className="flex items-center gap-2.5 hover:underline">
          <PersonAvatar firstName={user.first_name} lastName={user.last_name} photo={user.photo} className="size-8" />
          <span className="text-sm font-medium text-ink">
            {user.first_name} {user.last_name}
          </span>
        </Link>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{student.admission_number}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{genderLabel(student.gender)}</td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <EnrollmentStatusBadge status={student.enrollment_status} />
      </td>
    </tr>
  );
}
