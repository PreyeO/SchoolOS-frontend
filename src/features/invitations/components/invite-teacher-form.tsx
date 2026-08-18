"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { teacherTypeDescription, teacherTypeLabel } from "@/features/staff/lib/teacher-type-label";
import type { TeacherType } from "@/features/staff/types";

import { inviteTeacherSchema, type InviteTeacherFormValues } from "../schemas/invite-teacher-schema";
import { useInviteTeacher } from "../hooks/use-invite-teacher";
import { TeacherInvitedResult } from "./teacher-invited-result";

// Labels and descriptions come from the shared helper, so this form and the
// pickers that filter on type can't drift apart in what they call things.
const TEACHER_TYPES: TeacherType[] = ["class", "subject", "both"];

export function InviteTeacherForm() {
  const { mutate, isPending } = useInviteTeacher();
  // The invite response is only a detail string, so the invitee is captured from
  // the submitted values to name them back on the success panel.
  const [invited, setInvited] = useState<{
    name: string;
    email: string;
    // Carried through so the success panel can offer only the next steps this
    // type actually allows.
    teacherType: TeacherType;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteTeacherFormValues>({
    resolver: zodResolver(inviteTeacherSchema),
    // teacher_type deliberately has no default. It used to sit on "class", so an
    // admin inviting a subject teacher who tabbed past this field made them a
    // form teacher without ever seeing the word. Better to require the answer.
    defaultValues: { first_name: "", last_name: "", email: "", phone_number: "" },
  });

  function onInvalid() {
    const first = Object.values(errors)[0];
    toast.error((first?.message as string) ?? "Please check the form and try again.");
  }

  function submit(values: InviteTeacherFormValues) {
    mutate(values, {
      onSuccess: () => {
        setInvited({
          name: `${values.first_name} ${values.last_name}`,
          email: values.email,
          teacherType: values.teacher_type,
        });
        reset();
      },
    });
  }

  if (invited) {
    return (
      <TeacherInvitedResult
        name={invited.name}
        email={invited.email}
        teacherType={invited.teacherType}
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

      {/* Radio cards rather than a <Select>: this is the one field on the form
          whose consequences aren't obvious from its label — it decides whether
          the person can take a register at all — and an option list can't carry
          the explanation. A native radio group keeps keyboard and screen-reader
          behaviour without a component. */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">
          Teacher type <span className="text-clay">*</span>
        </legend>
        <div className="space-y-2">
          {/* Selected styling via has-[:checked] rather than watch()ing the
              field: reading it in JS makes React Compiler skip memoizing this
              whole component, and the browser already knows which radio is
              checked. */}
          {TEACHER_TYPES.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer gap-3 rounded-xl border border-n-200 p-3 transition-colors hover:border-n-300 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                value={type}
                {...register("teacher_type")}
                className="mt-1 size-4 shrink-0 accent-primary"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">{teacherTypeLabel(type)}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-n-500">
                  {teacherTypeDescription(type)}
                </span>
              </span>
            </label>
          ))}
        </div>
        {errors.teacher_type?.message && (
          <p role="alert" className="mt-1.5 text-xs text-clay">
            {errors.teacher_type.message}
          </p>
        )}
      </fieldset>

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
