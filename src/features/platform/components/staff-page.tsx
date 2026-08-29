"use client";

import { ErrorState } from "@/components/shared/error-state";
import { ActiveBadge } from "@/components/shared/active-badge";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { formatDate } from "@/lib/text/format-date";

import { usePlatformAdmins } from "../hooks/use-platform";

// SchoolOS's own staff.
//
// Read-only, and not by choice: POST /api/platform-admins/ returns 405 — the
// viewset is list/retrieve only. Platform admins are created with
// `manage.py createsuperuser`, so an "Add admin" button here would be a lie.
// The footnote says so rather than leaving someone hunting for the control.
export function PlatformStaffPage() {
  const { data: admins, isPending, isError, error } = usePlatformAdmins();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">SchoolOS staff</h1>
        <p className="mt-1 text-sm text-n-500">
          Everyone with platform-level access, and what they can do.
        </p>
      </div>

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading staff…</p>
      ) : isError || !admins ? (
        <ErrorState error={error} resourceLabel="platform staff" />
      ) : (
        <ul className="space-y-3">
          {admins.map((admin) => (
            <li key={admin.id} className="rounded-xl border border-n-200 bg-white p-4">
              <div className="flex flex-wrap items-start gap-3">
                <PersonAvatar
                  firstName={admin.user.first_name}
                  lastName={admin.user.last_name}
                  photo={admin.user.photo}
                  className="size-10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">
                      {admin.user.first_name} {admin.user.last_name}
                    </p>
                    {!admin.is_active && <ActiveBadge isActive={false} />}
                  </div>
                  <p className="truncate text-xs text-n-500">{admin.user.email}</p>
                  <p className="mt-0.5 text-[11px] text-n-400">
                    Joined {formatDate(admin.created_at.slice(0, 10))}
                  </p>
                </div>
                {admin.platform_admin_role && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                    {admin.platform_admin_role.name}
                  </span>
                )}
              </div>

              {admin.platform_admin_role && (
                <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-n-100 pt-3">
                  {admin.platform_admin_role.permissions.map((permission) => (
                    <li
                      key={permission}
                      className="rounded-full bg-n-100 px-2 py-0.5 font-mono text-[10px] text-n-600"
                    >
                      {permission}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-n-400">
        Platform admins are created from the server (<code>createsuperuser</code>) — there
        is no API to add one, so this list is read-only.
      </p>
    </div>
  );
}
