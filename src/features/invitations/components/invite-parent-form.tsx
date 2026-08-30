"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";

import { inviteParentSchema, type InviteParentFormValues } from "../schemas/invite-parent-schema";
import { useInviteParent } from "../hooks/use-invite-parent";
import { InviteChildrenField, type ChildDraft } from "./invite-children-field";

export function InviteParentForm() {
  const { mutate, isPending } = useInviteParent();
  const [children, setChildren] = useState<ChildDraft[]>([]);

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

  // Only the three fields the endpoint wants; the display name and admission
  // number on each draft are for this form's own rows.
  function submit(values: InviteParentFormValues) {
    const students = children.map((c) => ({
      student_profile_id: c.student_profile_id,
      relationship: c.relationship,
      is_primary_contact: c.is_primary_contact,
    }));
    mutate(
      { ...values, students: students.length > 0 ? students : undefined },
      {
        onSuccess: () => {
          reset();
          setChildren([]);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(submit, onInvalid)} noValidate className="space-y-4">
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

      <fieldset>
        <legend className="mb-1 text-sm font-medium text-ink">Children (optional)</legend>
        <p className="mb-2 text-xs text-n-500">
          Linked the moment the invite is sent, so they see their children&rsquo;s results, fees and
          attendance as soon as they sign in.
        </p>
        <InviteChildrenField value={children} onChange={setChildren} />
      </fieldset>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 font-semibold"
      >
        {isPending ? "Sending invite…" : "Invite parent"}
      </Button>
    </form>
  );
}
