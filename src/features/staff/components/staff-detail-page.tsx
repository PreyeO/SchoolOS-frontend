"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ActiveBadge } from "@/components/shared/active-badge";
import { DetailField } from "@/components/shared/detail-field";
import { ErrorState } from "@/components/shared/error-state";
import { OffboardDialog, otherPersonasOf } from "@/components/shared/offboard-dialog";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { ProfileHeaderCard } from "@/components/shared/profile-header-card";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { armDisplayName } from "@/lib/school/arm-display-name";
import { formatDate } from "@/lib/text/format-date";
import { TeacherSubjectAssignments } from "@/features/teaching-assignments/components/teacher-subject-assignments";

import { useOffboardTeacher } from "../hooks/use-offboard-teacher";
import { useTeacherDetail } from "../hooks/use-teacher-detail";
import { teacherTypeLabel } from "../lib/teacher-type-label";

export function StaffDetailPage({ id }: { id: string }) {
  const { data: teacher, isPending, isError, error } = useTeacherDetail(id);
  const router = useRouter();
  const canOffboard = useHasSchoolPermission("edit_staff");
  const offboard = useOffboardTeacher(id);

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

      <ProfileHeaderCard
        avatar={<PersonAvatar firstName={user.first_name} lastName={user.last_name} photo={user.photo} className="size-14" />}
        name={`${user.first_name} ${user.last_name}`}
        badges={<ActiveBadge isActive={teacher.membership.is_active} />}
        details={[user.email, user.phone_number]}
        // edit_staff. Offboarding your own teacher persona is allowed: you
        // keep the admin access you're using to do it.
        actions={
          canOffboard && (
            <OffboardDialog
              personName={`${user.first_name} ${user.last_name}`}
              role="teacher"
              consequence="They'll be removed as form teacher and from every subject they teach. Scores they entered and notes they wrote stay on record."
              otherPersonas={otherPersonasOf(teacher.membership, "teacher")}
              isPending={offboard.isPending}
              onConfirm={(reason) => offboard.mutateAsync(reason).then(() => router.push("/staff"))}
            />
          )
        }
      />

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Employment</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Employee ID" value={teacher.employee_id} />
          <DetailField label="Type" value={teacherTypeLabel(teacher.teacher_type)} />
          <DetailField label="Qualification" value={teacher.qualification} />
          <DetailField label="Specialization" value={teacher.specialization} />
          <DetailField
            label="Account activated"
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
        {/* The empty state is noun-free on purpose: this page doesn't load
            classes, so it can't know whether this school says "class" or "arm" —
            and it doesn't need to in order to say nothing is assigned. */}
        {teacher.class_arms.length === 0 ? (
          <p className="text-sm text-n-400 italic">Not assigned as a form teacher yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {teacher.class_arms.map((arm) => (
              <li
                key={arm.id}
                className="rounded-full border border-n-200 px-2.5 py-0.5 text-xs text-ink"
              >
                {/* Placeholder arms show their class name, never "Default". */}
                {armDisplayName(arm, arm.class_name)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <TeacherSubjectAssignments teacherProfileId={teacher.id} />
    </div>
  );
}
