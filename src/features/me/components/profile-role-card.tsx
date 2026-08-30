import { DetailField } from "@/components/shared/detail-field";
import { armDisplayName } from "@/lib/school/arm-display-name";

import type { MeResponse } from "../types";
import { ProfileCard } from "./profile-card";

function countLabel(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

// What each of this person's personas actually amounts to at this school.
//
// One card per active persona rather than one merged card, because a person can
// hold several at once (this account is admin and teacher) and the facts don't
// belong together: an admin role is a permission set, a teaching load is a list
// of classes.
export function ProfileRoleCards({ me }: { me: MeResponse }) {
  const role = me.admin?.school_admin_role;

  return (
    <>
      {me.admin && (
        <ProfileCard title="Admin role">
          {/* A roleless admin is a real state the backend allows, and it means
              no permissions at all rather than a missing label. */}
          <DetailField label="Role" value={role?.name ?? "No role assigned"} />
          <DetailField
            label="Permissions"
            value={role ? countLabel(role.permissions.length, "permission", "permissions") : "None"}
          />
        </ProfileCard>
      )}

      {me.teacher && (
        <ProfileCard title="Teaching">
          <DetailField
            label="Class teacher of"
            // armDisplayName, not arm.name: an unnamed arm carries a
            // placeholder literally called "Default", which must never be
            // shown to a teacher as though it were their class.
            value={
              me.teacher.class_arms.length > 0
                ? me.teacher.class_arms.map((arm) => armDisplayName(arm, arm.class_name)).join(", ")
                : "No class assigned"
            }
          />
          <DetailField
            label="Subjects assigned"
            value={countLabel(me.teacher.subject_assignments.length, "subject", "subjects")}
          />
        </ProfileCard>
      )}

      {me.parent && (
        <ProfileCard title="Children">
          <DetailField
            label="Linked to"
            value={
              me.parent.student_links.length > 0
                ? me.parent.student_links.map((link) => link.student_name).join(", ")
                : "No children linked"
            }
          />
          <DetailField
            label="Records"
            value={countLabel(me.parent.student_links.length, "child", "children")}
          />
        </ProfileCard>
      )}

      {me.student && (
        <ProfileCard title="Your class">
          <DetailField
            label="Class"
            value={
              me.student.current_class
                ? armDisplayName(
                    {
                      name: me.student.current_class.arm_name,
                      is_default: me.student.current_class.is_default,
                    },
                    me.student.current_class.class_name,
                  )
                : "Not enrolled"
            }
          />
          <DetailField
            label="Guardians"
            value={
              me.student.parent_links.length > 0
                ? me.student.parent_links.map((link) => link.parent_name).join(", ")
                : "None linked"
            }
          />
        </ProfileCard>
      )}
    </>
  );
}
