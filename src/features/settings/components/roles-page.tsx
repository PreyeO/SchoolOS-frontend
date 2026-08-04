"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { useRoles } from "@/features/invitations/hooks/use-roles";

import { usePermissionsCatalog } from "../hooks/use-permissions-catalog";
import { useCreateRole } from "../hooks/use-role-mutations";
import { RoleFormDialog } from "./role-form-dialog";
import { RolesTable } from "./roles/roles-table";

export function RolesPage() {
  const { data: roles, isPending: rolesPending, isError: rolesError, error: rolesErrorObj } = useRoles();
  const {
    data: catalog,
    isPending: catalogPending,
    isError: catalogError,
    error: catalogErrorObj,
  } = usePermissionsCatalog();
  const createRole = useCreateRole();

  if (rolesPending || catalogPending) {
    return <p className="text-sm text-n-400" role="status">Loading your roles…</p>;
  }

  if (rolesError || catalogError || !roles || !catalog) {
    return <ErrorState error={rolesErrorObj ?? catalogErrorObj} resourceLabel="your roles" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-n-500">Create custom roles and control what each staff member can access.</p>
        </div>
        <RoleFormDialog
          title="Add a role"
          initialValues={{ name: "", permissions: [] }}
          catalog={catalog}
          isPending={createRole.isPending}
          onSave={(values) => createRole.mutateAsync(values)}
          trigger={
            <Button type="button">
              <Plus className="size-4 mr-1" /> Add role
            </Button>
          }
        />
      </div>

      <RolesTable roles={roles} catalog={catalog} />
    </div>
  );
}
