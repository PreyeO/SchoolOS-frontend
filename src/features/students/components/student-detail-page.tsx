"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ActiveBadge } from "@/components/shared/active-badge";
import { ErrorState } from "@/components/shared/error-state";
import { PersonAvatar } from "@/components/shared/person-avatar";

import { useStudentDetail } from "../hooks/use-student-detail";
import { useCanAccess } from "@/lib/auth/use-can-access";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";

import { useCanEditStudent } from "../hooks/use-update-student";
import { isSyntheticEmail } from "../lib/is-synthetic-email";
import { EnrollmentCard } from "./enrollment-card";
import { EnrollmentStatusBadge } from "./enrollment-status-badge";
import { LinkParentDialog } from "./link-parent-dialog";
import { MedicalAlerts } from "./medical-alerts";
import { ReissuePasswordDialog } from "./reissue-password-dialog";
import { StudentParentLinks } from "./student-parent-links";
import { StudentProfileCards } from "./student-profile-cards";
import { StudentResultsSection } from "./student-results-section";

export function StudentDetailPage({ id }: { id: string }) {
  const { data: student, isPending, isError, error } = useStudentDetail(id);
  // Admins with edit_students, or any teacher — mirroring the backend's
  // CanEditStudentProfile. Each card carries its own Edit, because the whitelist
  // is eighteen fields and PATCH is partial: nobody should have to open a
  // full-profile form to correct one allergy.
  const canEdit = useCanEditStudent();
  // Three actions on this page need MORE than CanEditStudentProfile, and a
  // teacher holds none of them — all three 403 for a teacher (verified live),
  // so they're hidden rather than left to fail on click:
  //   reissue-password + enroll  -> edit_students
  //   parent links (add/remove)  -> add_students
  // HasSchoolPermission hard-requires is_admin, so these are false for any
  // teacher and for an admin whose role lacks the permission.
  const canOpenDirectory = useCanAccess("/students");
  const canManageAccount = useHasSchoolPermission("edit_students");
  const canManageLinks = useHasSchoolPermission("add_students");

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
        {canManageAccount && isSyntheticEmail(user.email) && (
          <ReissuePasswordDialog studentId={student.id} />
        )}
      </div>

      <MedicalAlerts student={student} />

      <EnrollmentCard
        studentId={student.id}
        studentName={`${user.first_name} ${user.last_name}`}
        currentClass={student.current_class}
      />

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Results</h2>
        <StudentResultsSection studentId={student.id} />
      </div>

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
