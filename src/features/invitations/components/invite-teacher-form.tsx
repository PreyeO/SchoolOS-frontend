"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";

import { inviteTeacherSchema, type InviteTeacherFormValues } from "../schemas/invite-teacher-schema";
import { useInviteTeacher } from "../hooks/use-invite-teacher";
import { TeacherInvitedResult } from "./teacher-invited-result";

const TEACHER_TYPES = [
  { value: "class", label: "Class teacher" },
  { value: "subject", label: "Subject teacher" },
  { value: "both", label: "Both" },
] as const;

export function InviteTeacherForm() {
  const { mutate, isPending } = useInviteTeacher();
  // The invite response is only a detail string, so the invitee is captured from
  // the submitted values to name them back on the success panel.
  const [invited, setInvited] = useState<{ name: string; email: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteTeacherFormValues>({
    resolver: zodResolver(inviteTeacherSchema),
    defaultValues: { first_name: "", last_name: "", email: "", phone_number: "", teacher_type: "class" },
  });

  function onInvalid() {
    const first = Object.values(errors)[0];
    toast.error((first?.message as string) ?? "Please check the form and try again.");
  }

  function submit(values: InviteTeacherFormValues) {
    mutate(values, {
      onSuccess: () => {
        setInvited({ name: `${values.first_name} ${values.last_name}`, email: values.email });
        reset();
      },
    });
  }

  if (invited) {
    return (
      <TeacherInvitedResult
        name={invited.name}
        email={invited.email}
        onInviteAnother={() => setInvited(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(submit, onInvalid)} noValidate className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldWrapper id="teacher-first-name" label="First name" error={errors.first_name?.message} required>
          <Input id="teacher-first-name" autoComplete="given-name" {...register("first_name")} />
        </FieldWrapper>
        <FieldWrapper id="teacher-last-name" label="Last name" error={errors.last_name?.message} required>
          <Input id="teacher-last-name" autoComplete="family-name" {...register("last_name")} />
        </FieldWrapper>
      </div>

      <FieldWrapper id="teacher-email" label="Email" error={errors.email?.message} required>
        <Input id="teacher-email" type="email" autoComplete="email" {...register("email")} />
      </FieldWrapper>

      <FieldWrapper id="teacher-phone" label="Phone number" error={errors.phone_number?.message}>
        <Input id="teacher-phone" type="tel" placeholder="+234 800 000 0000" {...register("phone_number")} />
      </FieldWrapper>

      <FieldWrapper id="teacher-type" label="Teacher type" error={errors.teacher_type?.message} required>
        <select
          id="teacher-type"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register("teacher_type")}
        >
          {TEACHER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </FieldWrapper>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 font-semibold"
      >
        {isPending ? "Sending invite…" : "Invite teacher"}
      </Button>
    </form>
  );
}
