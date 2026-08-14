"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ActiveBadge } from "@/components/shared/active-badge";
import { DetailField } from "@/components/shared/detail-field";
import { ErrorState } from "@/components/shared/error-state";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { formatDate } from "@/lib/text/format-date";

import { useStudentDetail } from "../hooks/use-student-detail";
import { isSyntheticEmail } from "../lib/is-synthetic-email";
import { bloodGroupLabel, genderLabel, genotypeLabel, religionLabel } from "../lib/labels";
import { EnrollmentCard } from "./enrollment-card";
import { EnrollmentStatusBadge } from "./enrollment-status-badge";
import { LinkParentDialog } from "./link-parent-dialog";
import { ReissuePasswordDialog } from "./reissue-password-dialog";
import { StudentParentLinks } from "./student-parent-links";

export function StudentDetailPage({ id }: { id: string }) {
  const { data: student, isPending, isError, error } = useStudentDetail(id);

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading student profile…</p>;
  }

  if (isError || !student) {
    return <ErrorState error={error} resourceLabel="this student profile" />;
  }

  const { user } = student;

  return (
    <div className="space-y-6">
      <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-n-500 hover:text-ink">
        <ArrowLeft className="size-4" /> Back to students
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-n-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <PersonAvatar firstName={user.first_name} lastName={user.last_name} photo={user.photo} className="size-14" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-ink truncate">
                {user.first_name} {user.last_name}
              </h1>
              {/* The account badge only when it's news. An active account
                  alongside an enrolment badge adds nothing — both just mean "in
                  good standing" — whereas a deactivated account sitting next to
                  "Enrolled" is exactly the contradiction worth showing. */}
              {!student.membership.is_active && <ActiveBadge isActive={false} />}
              <EnrollmentStatusBadge status={student.enrollment_status} />
            </div>
            <p className="mt-0.5 text-sm text-n-500">{user.email}</p>
          </div>
        </div>
        {isSyntheticEmail(user.email) && <ReissuePasswordDialog studentId={student.id} />}
      </div>

      <EnrollmentCard
        studentId={student.id}
        studentName={`${user.first_name} ${user.last_name}`}
        currentClass={student.current_class}
      />

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Admission</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <DetailField label="Admission no." value={student.admission_number} />
          <DetailField label="Gender" value={genderLabel(student.gender)} />
          <DetailField label="Date of birth" value={student.date_of_birth ? formatDate(student.date_of_birth) : null} />
          <DetailField
            label="Date of admission"
            value={student.date_of_admission ? formatDate(student.date_of_admission) : null}
          />
          <DetailField label="Previous school" value={student.previous_school} />
          <DetailField label="Nationality" value={student.nationality} />
        </div>
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Personal & medical</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <DetailField label="State of origin" value={student.state_of_origin} />
          <DetailField label="Religion" value={student.religion ? religionLabel(student.religion) : null} />
          <DetailField label="Blood group" value={student.blood_group ? bloodGroupLabel(student.blood_group) : null} />
          <DetailField label="Genotype" value={student.genotype ? genotypeLabel(student.genotype) : null} />
          <DetailField label="Allergies" value={student.allergies} />
          <DetailField label="Chronic conditions" value={student.chronic_conditions} />
          <DetailField label="Disabilities" value={student.disabilities} />
          <DetailField label="Emergency medications" value={student.emergency_medications} />
        </div>
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">About</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <DetailField label="Favourite food" value={student.favourite_food} />
          <DetailField label="Hobbies" value={student.hobbies} />
          <DetailField label="Ambitions" value={student.ambitions} />
        </div>
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Linked parents</h2>
          <LinkParentDialog studentId={student.id} />
        </div>
        <StudentParentLinks studentId={student.id} links={student.parent_links} />
      </div>
    </div>
  );
}
