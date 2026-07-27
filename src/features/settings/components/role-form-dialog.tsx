"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";

import { roleSchema, type RoleFormValues } from "../schemas/role-schema";
import { PermissionChecklist } from "./permission-checklist";

interface Props {
  trigger: React.ReactNode;
  title: string;
  initialValues: RoleFormValues;
  catalog: string[];
  isPending?: boolean;
  onSave: (values: RoleFormValues) => Promise<unknown>;
}

export function RoleFormDialog({ trigger, title, initialValues, catalog, isPending, onSave }: Props) {
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialValues,
  });

  const permissions = useWatch({ control, name: "permissions" }) ?? [];

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(initialValues);
  }

  function togglePermission(permission: string) {
    const next = permissions.includes(permission)
      ? permissions.filter((p) => p !== permission)
      : [...permissions, permission];
    setValue("permissions", next);
  }

  function toggleGroup(groupPermissions: string[], selectAll: boolean) {
    const next = selectAll
      ? [...new Set([...permissions, ...groupPermissions])]
      : permissions.filter((p) => !groupPermissions.includes(p));
    setValue("permissions", next);
  }

  async function submit(values: RoleFormValues) {
    try {
      await onSave(values);
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FieldWrapper id="role-name" label="Role name" error={errors.name?.message}>
            <Input id="role-name" aria-invalid={!!errors.name} {...register("name")} />
          </FieldWrapper>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Permissions</p>
            <PermissionChecklist
              catalog={catalog}
              selected={permissions}
              onToggle={togglePermission}
              onToggleGroup={toggleGroup}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
