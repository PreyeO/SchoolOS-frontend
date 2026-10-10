"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ActiveBadge } from "@/components/shared/active-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DetailField } from "@/components/shared/detail-field";
import { ErrorState } from "@/components/shared/error-state";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { formatDate } from "@/lib/text/format-date";

import { useAdminDetail } from "../hooks/use-admin-detail";
import { useUnassignRole } from "../hooks/use-unassign-role";
import { AdminOffboardAction } from "./admin-offboard-action";
import { AssignRoleDialog } from "./assign-role-dialog";

export function AdminDetailPage({ id }: { id: string }) {
  const { data: admin, isPending, isError, error } = useAdminDetail(id);
  const unassignRole = useUnassignRole(id);

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading admin profile…</p>;
  }

  if (isError || !admin) {
    return <ErrorState error={error} resourceLabel="this admin profile" />;
  }

  const { user, school_admin_role: role } = admin;

  return (
    <div className="space-y-6">
      <Link href="/admins" className="inline-flex items-center gap-1.5 text-sm text-n-500 hover:text-ink">
        <ArrowLeft className="size-4" /> Back to school admins
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-n-200 bg-white p-5">
        <div className="flex min-w-0 items-center gap-4">
          <PersonAvatar firstName={user.first_name} lastName={user.last_name} photo={user.photo} className="size-14" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-ink truncate">
                {user.first_name} {user.last_name}
              </h1>
              <ActiveBadge isActive={admin.membership.is_active} />
            </div>
            <p className="mt-0.5 text-sm text-n-500">{user.email}</p>
            {user.phone_number && <p className="text-sm text-n-500">{user.phone_number}</p>}
          </div>
        </div>
        <AdminOffboardAction admin={admin} />
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Role</h2>
        <DetailField
          label="Account activated"
          value={admin.date_joined_school ? formatDate(admin.date_joined_school) : null}
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            {role ? (
              <>
                <p className="text-sm font-medium text-ink">{role.name}</p>
                <p className="text-xs text-n-500">
                  {role.permissions.length} permission{role.permissions.length !== 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <p className="text-sm text-n-400 italic">No role assigned — this admin has no permissions.</p>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-2">
            <AssignRoleDialog adminId={admin.id} currentRoleId={role?.id} />
            {role && (
              <ConfirmDeleteDialog
                trigger={
                  <Button type="button" variant="ghost" size="sm">
                    Unassign
                  </Button>
                }
                title={`Unassign ${role.name}?`}
                description={`${user.first_name} will lose all permissions until a new role is assigned.`}
                confirmLabel="Unassign"
                isPending={unassignRole.isPending}
                onConfirm={() => unassignRole.mutate()}
              />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
