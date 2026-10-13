"use client";

import { DetailField } from "@/components/shared/detail-field";
import { ErrorState } from "@/components/shared/error-state";
import { SCHOOL_LEVELS } from "@/data/school-levels";
import { formatIsoDate } from "@/lib/text/format-date";

import { useMe } from "../hooks/use-me";
import { EditOwnDetailsButton } from "./edit-own-details-button";
import { ProfileCard } from "./profile-card";
import { ProfileHeader } from "./profile-header";
import { ProfileRoleCards } from "./profile-role-card";

// The signed-in person's own record.
//
// Mostly read-only by necessity: /api/users/ is POST-only, and the only
// self-update route is the teacher's (PATCH /teachers/:id/, 2026-10-13), which
// covers name, phone and photo. So a teacher gets Edit on Account and a photo
// control on the avatar; admins, parents and students still get a page about
// what the school knows about them. No password or notification controls —
// promising screens that don't exist is worse than their absence.
//
// Everything comes from the /me the app already has cached, so this page adds
// no request of its own.
export function ProfilePage() {
  const { data: me, isPending, isError, error } = useMe();

  if (isPending) {
    return (
      <p className="text-sm text-n-400" role="status">
        Loading your profile…
      </p>
    );
  }

  if (isError || !me) {
    return <ErrorState error={error} resourceLabel="your profile" />;
  }

  const levelLabels = me.school.levels
    .map((level) => SCHOOL_LEVELS.find((l) => l.value === level)?.label ?? level)
    .join(", ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Profile</h1>
        <p className="mt-1 text-sm text-n-500">
          Your account and what it gives you access to at this school.
        </p>
      </div>

      <ProfileHeader me={me} />

      <ProfileCard title="Account" action={<EditOwnDetailsButton me={me} />}>
        <DetailField label="First name" value={me.user.first_name} />
        <DetailField label="Last name" value={me.user.last_name} />
        <DetailField label="Email" value={me.user.email} />
        <DetailField label="Phone number" value={me.user.phone_number} />
        <DetailField label="Account created" value={formatIsoDate(me.user.created_at)} />
      </ProfileCard>

      <ProfileCard title="School">
        <DetailField label="School" value={me.school.name} />
        <DetailField label="Address" value={me.school.subdomain} />
        <DetailField label="Location" value={`${me.school.city}, ${me.school.state}`} />
        <DetailField label="Levels" value={levelLabels} />
        {/* The membership date, not the user's: when this person joined THIS
            school, which differs from account creation for anyone invited. */}
        <DetailField label="Joined school" value={formatIsoDate(me.membership.created_at)} />
      </ProfileCard>

      <ProfileRoleCards me={me} />
    </div>
  );
}
