"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";

import { inviteParentSchema, type InviteParentFormValues } from "../schemas/invite-parent-schema";
import { useInviteParent } from "../hooks/use-invite-parent";

export function InviteParentForm() {
  const { mutate, isPending } = useInviteParent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteParentFormValues>({
    resolver: zodResolver(inviteParentSchema),
    defaultValues: { first_name: "", last_name: "", email: "", phone_number: "" },
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
        <FieldWrapper id="parent-first-name" label="First name" error={errors.first_name?.message} required>
          <Input id="parent-first-name" autoComplete="given-name" {...register("first_name")} />
        </FieldWrapper>
        <FieldWrapper id="parent-last-name" label="Last name" error={errors.last_name?.message} required>
          <Input id="parent-last-name" autoComplete="family-name" {...register("last_name")} />
        </FieldWrapper>
      </div>

      <FieldWrapper id="parent-email" label="Email" error={errors.email?.message} required>
        <Input id="parent-email" type="email" autoComplete="email" {...register("email")} />
      </FieldWrapper>

      <FieldWrapper id="parent-phone" label="Phone number" error={errors.phone_number?.message}>
        <Input id="parent-phone" type="tel" placeholder="+234 800 000 0000" {...register("phone_number")} />
      </FieldWrapper>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-amber hover:bg-amber/90 text-ink font-semibold"
      >
        {isPending ? "Sending invite…" : "Invite parent"}
      </Button>
    </form>
  );
}
