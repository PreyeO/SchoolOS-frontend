"use client";

import { useRouter } from "next/navigation";

import { OffboardDialog, otherPersonasOf } from "@/components/shared/offboard-dialog";
import { useRoles } from "@/features/invitations/hooks/use-roles";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { useAuthStore } from "@/stores/auth-store";

import { useOffboardAdmin } from "../hooks/use-offboard-admin";
import type { AdminDetail } from "../types";

// manage_roles. Two cases where offboarding is withheld, each with a reason
// rather than a missing button:
//   - The Owner: the backend refuses ("assign another admin as Owner first").
//     The role summary on this page has no is_owner, so it's read from the
//     roles list — the same cached query AssignRoleDialog already loads.
//   - Yourself: the backend has NO self-check. An admin offboarding their own
//     admin persona would lock themselves out mid-session.
export function AdminOffboardAction({ admin }: { admin: AdminDetail }) {
  const router = useRouter();
  const canOffboard = useHasSchoolPermission("manage_roles");
  const ownMembershipId = useAuthStore((s) => s.claims?.membership_id ?? null);
  const { data: roles } = useRoles();
  const offboard = useOffboardAdmin(admin.id);

  if (!canOffboard) return null;

  const roleId = admin.school_admin_role?.id;
  const isOwner = !!roleId && !!roles?.find((r) => r.id === roleId)?.is_owner;
  const isSelf = admin.membership.id === ownMembershipId;

  if (isOwner || isSelf) {
    return (
      <p className="max-w-xs text-xs text-n-400">
        {isOwner
          ? "The Owner can't be offboarded. Give another admin the Owner role first."
          : "You can't offboard yourself. Another admin with role management can."}
      </p>
    );
  }

  const name = `${admin.user.first_name} ${admin.user.last_name}`;

  return (
    <OffboardDialog
      personName={name}
      role="admin"
      consequence="Their role and every permission it grants are removed. What they did stays in the audit log."
      otherPersonas={otherPersonasOf(admin.membership, "admin")}
      isPending={offboard.isPending}
      onConfirm={(reason) => offboard.mutateAsync(reason).then(() => router.push("/admins"))}
    />
  );
}
