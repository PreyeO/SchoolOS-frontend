import { BadgeCheck } from "lucide-react";

import { PersonAvatar } from "@/components/shared/person-avatar";
import { ActiveBadge } from "@/components/shared/active-badge";
import { EditTeacherPhotoDialog } from "@/features/staff/components/edit-teacher-photo-dialog";
import type { MeResponse } from "../types";
import { activePersonas } from "../lib/personas";

export function ProfileHeader({ me }: { me: MeResponse }) {
  const { user, membership } = me;
  const personas = activePersonas(membership);
  const isOwner = me.admin?.school_admin_role?.is_owner ?? false;

  return (
    <div className="flex flex-wrap items-start gap-4 rounded-xl border border-n-200 bg-white p-5">
      {/* A teacher can set their own photo (PATCH /teachers/:id/ photo_key);
          nobody else has a route for it, so they get the plain avatar. */}
      {me.teacher ? (
        <EditTeacherPhotoDialog
          teacherId={me.teacher.id}
          firstName={user.first_name}
          lastName={user.last_name}
          photo={user.photo}
          className="size-16"
        />
      ) : (
        <PersonAvatar
          firstName={user.first_name}
          lastName={user.last_name}
          photo={user.photo}
          className="size-16"
        />
      )}

      <div className="min-w-0 flex-1">
        <h2 className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-ink">
          {user.first_name} {user.last_name}
          {isOwner && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              Owner
            </span>
          )}
        </h2>

        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-n-500">
          {user.email}
          {/* Only shown when true. An unverified account can't reach this page
              at all — /me returns state "verify_email" and the shell redirects
              — so a "not verified" pill would be a state nobody can see. */}
          {user.is_email_verified && (
            <span className="inline-flex items-center gap-1 text-xs text-grass">
              <BadgeCheck className="size-3.5" />
              Verified
            </span>
          )}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {personas.map((persona) => (
            <span
              key={persona}
              className="rounded-full bg-n-100 px-2 py-0.5 text-[11px] font-medium text-n-600"
            >
              {persona}
            </span>
          ))}
          <ActiveBadge isActive={membership.is_active} />
        </div>
      </div>
    </div>
  );
}
