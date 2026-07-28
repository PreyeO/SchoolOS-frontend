import Link from "next/link";

import type { ParentStudentLink } from "../types";

export function ParentStudentLinks({ links }: { links: ParentStudentLink[] }) {
  if (links.length === 0) {
    return <p className="text-sm text-n-400 italic">No children linked yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.id} className="flex items-center justify-between gap-3 rounded-lg border border-n-100 px-3 py-2">
          <div className="min-w-0">
            <Link href={`/students/${link.student_id}`} className="text-sm font-medium text-ink hover:underline">
              {link.student_name}
            </Link>
            <p className="text-xs text-n-500">Admission no. {link.admission_number}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="rounded-full bg-n-100 px-2 py-0.5 text-[11px] text-n-500 capitalize">
              {link.relationship}
            </span>
            {link.is_primary_contact && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Primary contact
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
