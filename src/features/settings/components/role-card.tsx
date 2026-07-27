"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import type { Role } from "@/features/invitations/types";

import { groupPermissions } from "../lib/permission-groups";
import { useDeleteRole, useUpdateRole } from "../hooks/use-role-mutations";
import { RoleFormDialog } from "./role-form-dialog";

export function RoleCard({ role, catalog }: { role: Role; catalog: string[] }) {
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const coverage = groupPermissions(catalog)
    .map((g) => ({ label: g.label, count: g.permissions.filter((p) => role.permissions.includes(p)).length, total: g.permissions.length }))
    .filter((g) => g.count > 0);

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-n-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-ink truncate">{role.name}</p>
          {role.is_owner && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              Owner
            </span>
          )}
        </div>
        {coverage.length === 0 ? (
          <p className="mt-1.5 text-xs text-n-400 italic">No permissions assigned.</p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {coverage.map((g) => (
              <span key={g.label} className="rounded-full border border-n-200 px-2 py-0.5 text-[11px] text-n-500">
                {g.label} {g.count}/{g.total}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* The Owner role's permission set and name are backend-locked (rename and
          delete are rejected outright) — hiding both actions avoids a round-trip
          just to show an error the UI already knows will happen. */}
      {!role.is_owner && (
        <span className="flex shrink-0 items-center gap-1">
          <RoleFormDialog
            title="Edit role"
            initialValues={{ name: role.name, permissions: role.permissions }}
            catalog={catalog}
            isPending={updateRole.isPending}
            onSave={(values) => updateRole.mutateAsync({ id: role.id, payload: values })}
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${role.name}`}>
                <Pencil className="size-3.5" />
              </Button>
            }
          />
          <ConfirmDeleteDialog
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${role.name}`}>
                <Trash2 className="size-3.5" />
              </Button>
            }
            title={`Delete ${role.name}?`}
            description="Admins currently assigned this role will lose it and need to be reassigned."
            isPending={deleteRole.isPending}
            onConfirm={() => deleteRole.mutate(role.id)}
          />
        </span>
      )}
    </div>
  );
}
