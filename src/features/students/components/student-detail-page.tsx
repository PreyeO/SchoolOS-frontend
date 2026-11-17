"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ActiveBadge } from "@/components/shared/active-badge";
import { ErrorState } from "@/components/shared/error-state";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { ProfileHeaderCard } from "@/components/shared/profile-header-card";

import { StudentResultCardSection } from "@/features/scratch-cards/components/student-result-card-section";

import { useStudentDetail } from "../hooks/use-student-detail";
import { useCanAccess } from "@/lib/auth/use-can-access";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";

import { useCanEditStudent } from "../hooks/use-update-student";
import { studentPhoto } from "../lib/student-photo";
import { EditStudentPhotoDialog } from "./edit-student-photo-dialog";
import { EnrollmentCard } from "./enrollment-card";
import { EnrollmentStatusBadge } from "./enrollment-status-badge";
import { LinkParentDialog } from "./link-parent-dialog";
import { MedicalAlerts } from "./medical-alerts";
import { StudentHeaderActions } from "./student-header-actions";
import { StudentParentLinks } from "./student-parent-links";
import { StudentNotesSection } from "./notes/student-notes-section";
import { StudentProfileCards } from "./student-profile-cards";
import { StudentResultsSection } from "./student-results-section";

export function StudentDetailPage({ id }: { id: string }) {
  const { data: student, isPending, isError, error } = useStudentDetail(id);
  // Admins with edit_students, or any teacher — mirroring the backend's
  // CanEditStudentProfile. Each card carries its own Edit, because the whitelist
  // is eighteen fields and PATCH is partial: nobody should have to open a
  // full-profile form to correct one allergy.
  const canEdit = useCanEditStudent();
  // Several actions on this page need MORE than CanEditStudentProfile, and a
  // teacher holds none of them, so they're hidden rather than left to 403:
  //   header actions (reissue, name, status, delete) -> StudentHeaderActions
  //   enroll                                          -> EnrollmentCard
  //   parent links (add/remove)                       -> add_students
  // HasSchoolPermission hard-requires is_admin, so these are false for any
  // teacher and for an admin whose role lacks the permission.
  const canOpenDirectory = useCanAccess("/students");
  const canManageLinks = useHasSchoolPermission("add_students");
  const canManageCards = useHasSchoolPermission("manage_scratch_cards");

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading student profile…</p>;
  }

  if (isError || !student) {
    return <ErrorState error={error} resourceLabel="this student profile" />;
  }

  const { user } = student;

  return (
    <div className="space-y-6">
      {/* This page serves two routes — the admin directory's /students/<id>
          and a teacher's /my-students/<id> — so the way back differs by who is
          reading. /students is admin-only, and sending a teacher there lands
          them on RouteAccessGuard's refusal. */}
      <Link
        href={canOpenDirectory ? "/students" : "/my-students"}
        className="inline-flex items-center gap-1.5 text-sm text-n-500 hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        {canOpenDirectory ? "Back to students" : "Back to my students"}
      </Link>

      <ProfileHeaderCard
        // The avatar itself is the photo control for anyone who may edit —
        // see EditStudentPhotoDialog. A reader who may not gets the plain
        // avatar, with no affordance promising an action they'd be refused.
        avatar={
          canEdit ? (
            <EditStudentPhotoDialog student={student} />
          ) : (
            <PersonAvatar
              firstName={user.first_name}
              lastName={user.last_name}
              photo={studentPhoto(student)}
              className="size-14"
            />
          )
        }
        name={`${user.first_name} ${user.last_name}`}
        // The account badge only when it's news. An active account alongside
        // an enrolment badge adds nothing — both just mean "in good standing" —
        // whereas a deactivated account sitting next to "Enrolled" is exactly
        // the contradiction worth showing.
        badges={
          <>
            {!student.membership.is_active && <ActiveBadge isActive={false} />}
            <EnrollmentStatusBadge status={student.enrollment_status} />
          </>
        }
        details={[user.email]}
        actions={<StudentHeaderActions student={student} />}
      />

      <MedicalAlerts student={student} />

      <EnrollmentCard
        studentId={student.id}
        studentName={`${user.first_name} ${user.last_name}`}
        currentClass={student.current_class}
        status={student.enrollment_status}
      />

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Results</h2>
        <StudentResultsSection studentId={student.id} />
      </div>

      <StudentNotesSection
        studentId={student.id}
        currentClassArmId={student.current_class?.class_arm_id ?? null}
      />

      {/* Admins with manage_scratch_cards only: a teacher reaches this page
          too, and every route behind the section would 403 for them. */}
      {canManageCards && (
        <StudentResultCardSection
          student={{ id: student.id, name: `${user.first_name} ${user.last_name}`, admission_number: student.admission_number }}
        />
      )}

      <StudentProfileCards student={student} canEdit={canEdit} />

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Linked parents</h2>
          {canManageLinks && <LinkParentDialog studentId={student.id} />}
        </div>
        <StudentParentLinks
          studentId={student.id}
          links={student.parent_links}
          canUnlink={canManageLinks}
        />
      </div>
    </div>
  );
}
