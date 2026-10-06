"use client";

import { DetailField } from "@/components/shared/detail-field";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { EnrollmentStatusBadge } from "@/features/students/components/enrollment-status-badge";
import { genderLabel } from "@/features/students/lib/labels";
import { isSyntheticEmail } from "@/features/students/lib/is-synthetic-email";
import { studentPhoto } from "@/features/students/lib/student-photo";
import { armDisplayName } from "@/lib/school/arm-display-name";
import { useTermSelection } from "@/lib/school/use-term-selection";
import { formatDate } from "@/lib/text/format-date";

import { useChildStudent } from "../hooks/use-child-student";
import { useSelectedChild } from "../hooks/use-selected-child";
import { ChildSwitcher } from "./child-switcher";
import { childScreenGuard } from "./child-screen-guard";

// The child's school record as a parent may see it.
//
// Read-only by necessity, not by choice: the update endpoint
// (PATCH /api/students/<id>/) is gated on CanEditStudentProfile — an admin with
// edit_students, or any teacher — so a parent cannot correct even their own
// child's details here. Anything wrong on this page has to go through the
// school office, which the footer note says rather than leaving a parent
// hunting for an edit button that will never exist.
export function ChildProfilePage() {
  const term = useTermSelection();
  const selected = useSelectedChild();
  const childId = selected.child?.student_id;
  const { student, isPending } = useChildStudent(childId, term.periodId);

  const guard = childScreenGuard(selected);
  const klass = student?.current_class;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Child profile</h1>
        <p className="mt-1 text-sm text-n-500">
          Your child&rsquo;s record as the school holds it.
        </p>
      </div>

      {guard ?? (
        <>
          <ChildSwitcher
            child={selected.child!}
            childrenLinks={selected.children}
            onSelect={selected.selectChild}
          />

          {isPending && !student ? (
            <p className="text-sm text-n-400" role="status">
              Loading profile…
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-n-200 bg-white p-5">
                <PersonAvatar
                  firstName={student?.user.first_name ?? selected.child!.student_name}
                  lastName={student?.user.last_name ?? ""}
                  photo={student ? studentPhoto(student) : null}
                  className="size-14 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-display text-lg font-bold text-ink">
                      {selected.child!.student_name}
                    </p>
                    {student && <EnrollmentStatusBadge status={student.enrollment_status} />}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-n-500">
                    {klass
                      ? armDisplayName(
                          { name: klass.arm_name, is_default: klass.is_default },
                          klass.class_name,
                        )
                      : "Not placed in a class"}
                    {klass?.session && <span className="text-n-400"> · {klass.session}</span>}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-n-200 bg-white p-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <DetailField
                    label="Admission number"
                    value={selected.child!.admission_number}
                  />
                  <DetailField
                    label="Gender"
                    value={student ? genderLabel(student.gender) : null}
                  />
                  <DetailField
                    label="Added to SchoolOS"
                    value={
                      student?.date_of_admission ? formatDate(student.date_of_admission) : null
                    }
                  />
                  {/* A student with no real address gets a synthetic internal
                      one (…@internal.myschoolos.io). Showing that to a parent
                      invites them to email it, so it's hidden rather than
                      displayed as a contact. */}
                  <DetailField
                    label="Email"
                    value={
                      student && !isSyntheticEmail(student.user.email)
                        ? student.user.email
                        : null
                    }
                  />
                  <DetailField label="Phone" value={student?.user.phone_number} />
                  <DetailField
                    label="Your relationship"
                    value={
                      <span className="capitalize">
                        {selected.child!.relationship}
                        {selected.child!.is_primary_contact && " · Primary contact"}
                      </span>
                    }
                  />
                </div>
              </div>

              <p className="text-xs text-n-400">
                Something here wrong? The school office keeps these records — ask them
                to update it.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
