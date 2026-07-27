"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import type { Role } from "@/features/invitations/types";

import { groupPermissions } from "../../lib/permission-groups";
import { useDeleteRole, useUpdateRole } from "../../hooks/use-role-mutations";
import { RoleFormDialog } from "../role-form-dialog";

export function RoleTableRow({ role, catalog }: { role: Role; catalog: string[] }) {
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const coverage = groupPermissions(catalog)
    .map((g) => ({
      label: g.label,
      count: g.permissions.filter((p) => role.permissions.includes(p)).length,
      total: g.permissions.length,
    }))
    .filter((g) => g.count > 0);

  return (
    <tr className="border-b border-n-100 last:border-0 align-top">
      <td className="whitespace-nowrap px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink">{role.name}</span>
          {role.is_owner && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              Owner
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        {coverage.length === 0 ? (
          <span className="text-xs text-n-400 italic">No permissions assigned.</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {coverage.map((g) => (
              <span key={g.label} className="rounded-full border border-n-200 px-2 py-0.5 text-[11px] text-n-500">
                {g.label} {g.count}/{g.total}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-3 py-3 text-right">
        {!role.is_owner && (
          <span className="inline-flex items-center gap-1">
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
      </td>
    </tr>
  );
}
