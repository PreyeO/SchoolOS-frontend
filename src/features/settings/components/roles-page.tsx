"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRoles } from "@/features/invitations/hooks/use-roles";

import { usePermissionsCatalog } from "../hooks/use-permissions-catalog";
import { useCreateRole } from "../hooks/use-role-mutations";
import { RoleCard } from "./role-card";
import { RoleFormDialog } from "./role-form-dialog";

export function RolesPage() {
  const { data: roles, isPending: rolesPending, isError: rolesError } = useRoles();
  const { data: catalog, isPending: catalogPending, isError: catalogError } = usePermissionsCatalog();
  const createRole = useCreateRole();

  if (rolesPending || catalogPending) {
    return <p className="text-sm text-n-400" role="status">Loading your roles…</p>;
  }

  if (rolesError || catalogError || !roles || !catalog) {
    return <p className="text-sm text-clay" role="alert">Couldn&rsquo;t load your roles. Please refresh.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Roles & Permissions</h1>
        <p className="mt-1 text-sm text-n-500">Create custom roles and control what each staff member can access.</p>
      </div>

      <div className="space-y-2">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} catalog={catalog} />
        ))}
      </div>

      <RoleFormDialog
        title="Add a role"
        initialValues={{ name: "", permissions: [] }}
        catalog={catalog}
        isPending={createRole.isPending}
        onSave={(values) => createRole.mutateAsync(values)}
        trigger={
          <Button type="button" variant="ghost" size="sm" className="text-brand">
            <Plus className="size-4 mr-1" /> Add role
          </Button>
        }
      />
    </div>
  );
}
