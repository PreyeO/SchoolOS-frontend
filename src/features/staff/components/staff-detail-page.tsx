"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ActiveBadge } from "@/components/shared/active-badge";
import { DetailField } from "@/components/shared/detail-field";
import { ErrorState } from "@/components/shared/error-state";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { formatDate } from "@/lib/text/format-date";
import { TeacherSubjectAssignments } from "@/features/teaching-assignments/components/teacher-subject-assignments";

import { useTeacherDetail } from "../hooks/use-teacher-detail";
import { teacherTypeLabel } from "../lib/teacher-type-label";

export function StaffDetailPage({ id }: { id: string }) {
  const { data: teacher, isPending, isError, error } = useTeacherDetail(id);

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading teacher profile…</p>;
  }

  if (isError || !teacher) {
    return <ErrorState error={error} resourceLabel="this teacher profile" />;
  }

  const { user } = teacher;

  return (
    <div className="space-y-6">
      <Link href="/staff" className="inline-flex items-center gap-1.5 text-sm text-n-500 hover:text-ink">
        <ArrowLeft className="size-4" /> Back to teachers
      </Link>

      <div className="flex items-center gap-4 rounded-xl border border-n-200 bg-white p-5">
        <PersonAvatar firstName={user.first_name} lastName={user.last_name} photo={user.photo} className="size-14" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-ink truncate">
              {user.first_name} {user.last_name}
            </h1>
            <ActiveBadge isActive={teacher.membership.is_active} />
          </div>
          <p className="mt-0.5 text-sm text-n-500">{user.email}</p>
          {user.phone_number && <p className="text-sm text-n-500">{user.phone_number}</p>}
        </div>
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Employment</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Employee ID" value={teacher.employee_id} />
          <DetailField label="Type" value={teacherTypeLabel(teacher.teacher_type)} />
          <DetailField label="Qualification" value={teacher.qualification} />
          <DetailField label="Specialization" value={teacher.specialization} />
          <DetailField
            label="Joined this school"
            value={teacher.date_joined_school ? formatDate(teacher.date_joined_school) : null}
          />
        </div>
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-1 text-sm font-semibold text-ink">Form teacher of</h2>
        <p className="mb-4 text-xs text-n-400">
          Assign or change this in{" "}
          <Link href="/classes" className="text-primary hover:underline">
            Classes &amp; Arms
          </Link>
          .
        </p>
        {teacher.class_arms.length === 0 ? (
          <p className="text-sm text-n-400 italic">Not the form teacher of any arm.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {teacher.class_arms.map((arm) => (
              <li
                key={arm.id}
                className="rounded-full border border-n-200 px-2.5 py-0.5 text-xs text-ink"
              >
                {arm.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <TeacherSubjectAssignments teacherProfileId={teacher.id} />
    </div>
  );
}
