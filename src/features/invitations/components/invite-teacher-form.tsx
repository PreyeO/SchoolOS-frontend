"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { useClasses } from "@/features/settings/hooks/use-classes";
import type { TeacherType } from "@/features/staff/types";

import { inviteTeacherSchema, type InviteTeacherFormValues } from "../schemas/invite-teacher-schema";
import { useInviteTeacher } from "../hooks/use-invite-teacher";
import { ArmMultiSelect } from "./arm-multi-select";
import { TeacherInvitedResult } from "./teacher-invited-result";
import { TeacherTypeField } from "./teacher-type-field";

export function InviteTeacherForm() {
  const { mutate, isPending } = useInviteTeacher();
  const { data: classes } = useClasses();
  const [armIds, setArmIds] = useState<string[]>([]);
  // Mirrored from the radio group's own onChange rather than read with watch():
  // watch() makes React Compiler bail on memoizing this component, which is the
  // same reason the selected-card styling uses has-[:checked] instead.
  const [teacherType, setTeacherType] = useState<TeacherType | "">("");

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

  // A subject teacher can't hold an arm — the backend rejects the whole invite
  // for that combination — so the picker only appears once the type allows it,
  // and any ids already chosen are dropped if the admin then switches to
  // "subject". Sending them anyway would 400 with nothing created.
  const canHoldArms = teacherType === "class" || teacherType === "both";

  function onInvalid() {
    const first = Object.values(errors)[0];
    toast.error((first?.message as string) ?? "Please check the form and try again.");
  }

  function submit(values: InviteTeacherFormValues) {
    mutate(
      { ...values, class_arm_ids: canHoldArms && armIds.length > 0 ? armIds : undefined },
      {
        onSuccess: () => {
          setInvited({
            name: `${values.first_name} ${values.last_name}`,
            email: values.email,
            teacherType: values.teacher_type,
          });
          reset();
          setArmIds([]);
          setTeacherType("");
        },
      },
    );
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

      <TeacherTypeField
        field={register("teacher_type", {
          onChange: (e) => setTeacherType(e.target.value as TeacherType),
        })}
        error={errors.teacher_type?.message}
      />

      {canHoldArms && (
        <fieldset>
          <legend className="mb-1 text-sm font-medium text-ink">Class arms (optional)</legend>
          <p className="mb-2 text-xs text-n-500">
            Make them the class teacher of these arms. Assigned the moment the invite is sent, so
            they arrive already seated.
          </p>
          <ArmMultiSelect classes={classes ?? []} selected={armIds} onChange={setArmIds} />
        </fieldset>
      )}

      <Button type="submit" disabled={isPending} className="w-full h-11 font-semibold">
        {isPending ? "Sending invite…" : "Invite teacher"}
      </Button>
    </form>
  );
}
