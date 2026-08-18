"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";

import { inviteAdminSchema, type InviteAdminFormValues } from "../schemas/invite-admin-schema";
import { useInviteAdmin } from "../hooks/use-invite-admin";
import { useRoles } from "../hooks/use-roles";

export function InviteAdminForm() {
  const { mutate, isPending } = useInviteAdmin();
  const { data: roles, isPending: rolesLoading } = useRoles();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteAdminFormValues>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { first_name: "", last_name: "", email: "", phone_number: "", role_id: "" },
  });

  function onInvalid() {
    const first = Object.values(errors)[0];
    toast.error((first?.message as string) ?? "Please check the form and try again.");
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v, { onSuccess: () => reset() }), onInvalid)}
      noValidate
      className="space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldWrapper id="admin-first-name" label="First name" error={errors.first_name?.message} required>
          <Input id="admin-first-name" autoComplete="given-name" {...register("first_name")} />
        </FieldWrapper>
        <FieldWrapper id="admin-last-name" label="Last name" error={errors.last_name?.message} required>
          <Input id="admin-last-name" autoComplete="family-name" {...register("last_name")} />
        </FieldWrapper>
      </div>

      <FieldWrapper id="admin-email" label="Email" error={errors.email?.message} required>
        <Input id="admin-email" type="email" autoComplete="email" {...register("email")} />
      </FieldWrapper>

      <FieldWrapper id="admin-phone" label="Phone number" error={errors.phone_number?.message}>
        <Input id="admin-phone" type="tel" placeholder="+234 800 000 0000" {...register("phone_number")} />
      </FieldWrapper>

      <FieldWrapper id="admin-role" label="Role" error={errors.role_id?.message} required>
        <Select
          id="admin-role"
          disabled={rolesLoading}
          className="flex rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
          {...register("role_id")}>
          <option value="">{rolesLoading ? "Loading roles…" : "Select a role"}</option>
          {roles?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </FieldWrapper>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 font-semibold"
      >
        {isPending ? "Sending invite…" : "Invite admin"}
      </Button>
    </form>
  );
}
