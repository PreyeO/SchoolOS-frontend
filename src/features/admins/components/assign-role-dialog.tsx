"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRoles } from "@/features/invitations/hooks/use-roles";

import { useAssignRole } from "../hooks/use-assign-role";

interface Props {
  adminId: string;
  currentRoleId?: string;
}

export function AssignRoleDialog({ adminId, currentRoleId }: Props) {
  const [open, setOpen] = useState(false);
  const [roleId, setRoleId] = useState(currentRoleId ?? "");
  const { data: roles, isPending: rolesLoading } = useRoles();
  const assignRole = useAssignRole(adminId);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setRoleId(currentRoleId ?? "");
  }

  async function submit() {
    if (!roleId) return;
    try {
      await assignRole.mutateAsync(roleId);
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {currentRoleId ? "Change role" : "Assign role"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentRoleId ? "Change role" : "Assign a role"}</DialogTitle>
        </DialogHeader>
        <select
          aria-label="Role"
          disabled={rolesLoading}
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
        >
          <option value="">{rolesLoading ? "Loading roles…" : "Select a role"}</option>
          {roles?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={!roleId || assignRole.isPending}>
            {assignRole.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
