"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArmPicker } from "@/components/shared/arm-picker";
import { buildArmOptions } from "@/lib/school/arm-options";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { PasswordInput } from "@/features/auth/components/password-input";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useSchoolStore } from "@/stores/school-store";

import { addStudentSchema, type AddStudentFormValues } from "../schemas/add-student-schema";
import { useAddStudent } from "../hooks/use-add-student";
import type { StudentCreatedResponse } from "../types";
import { StudentCredentialsResult } from "./student-credentials-result";

export function AddStudentForm() {
  const { mutate, isPending } = useAddStudent();
  const [created, setCreated] = useState<StudentCreatedResponse | null>(null);
  const { data: classes, isPending: classesLoading } = useClasses();
  const sessionName = useSchoolStore((s) => s.currentSchool?.sessionName);

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const hasArms = groups.length > 0;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      admission_number: "",
      password: "",
      gender: "male",
      date_of_birth: "",
      email: "",
      class_arm_id: "",
    },
  });

  function onInvalid() {
    const first = Object.values(errors)[0];
    toast.error((first?.message as string) ?? "Please check the form and try again.");
  }

  if (created) {
    return (
      <StudentCredentialsResult
        student={created}
        onAddAnother={() => {
          setCreated(null);
          reset();
        }}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v, { onSuccess: setCreated }), onInvalid)}
      noValidate
      className="space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldWrapper id="student-first-name" label="First name" error={errors.first_name?.message} required>
          <Input id="student-first-name" autoComplete="given-name" {...register("first_name")} />
        </FieldWrapper>
        <FieldWrapper id="student-last-name" label="Last name" error={errors.last_name?.message} required>
          <Input id="student-last-name" autoComplete="family-name" {...register("last_name")} />
        </FieldWrapper>
      </div>

      <FieldWrapper id="student-admission" label="Admission number" error={errors.admission_number?.message} required>
        <Input id="student-admission" placeholder="e.g. MOUAU/EEE/16/93164" {...register("admission_number")} />
      </FieldWrapper>

      <FieldWrapper id="student-password" label="Password" error={errors.password?.message} required>
        <PasswordInput
          id="student-password"
          autoComplete="new-password"
          hasError={!!errors.password}
          describedBy={errors.password ? "student-password-error" : undefined}
          {...register("password")}
        />
      </FieldWrapper>

      <div className="grid sm:grid-cols-2 gap-4">
        <FieldWrapper id="student-gender" label="Gender" error={errors.gender?.message} required>
          <select
            id="student-gender"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register("gender")}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </FieldWrapper>
        <FieldWrapper id="student-dob" label="Date of birth" error={errors.date_of_birth?.message} hint="Optional">
          <Input id="student-dob" type="date" {...register("date_of_birth")} />
        </FieldWrapper>
      </div>

      <FieldWrapper
        id="student-email"
        label="Email"
        error={errors.email?.message}
        hint="Optional — leave blank to use a generated school email"
      >
        <Input id="student-email" type="email" {...register("email")} />
      </FieldWrapper>

      <FieldWrapper
        id="student-class-arm"
        label="Class"
        error={errors.class_arm_id?.message}
        hint="The student is enrolled here for the current term"
        required
      >
        <Controller
          name="class_arm_id"
          control={control}
          render={({ field }) => (
            <ArmPicker
              id="student-class-arm"
              groups={groups}
              value={field.value || null}
              onChange={field.onChange}
              placeholder={classesLoading ? "Loading classes…" : "Select a class…"}
              hasError={!!errors.class_arm_id}
            />
          )}
        />
      </FieldWrapper>

      {/* Both of these make the request fail server-side, so say so before the
          admin fills the whole form in. */}
      {!classesLoading && !hasArms && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          No class has an arm to enrol into yet. Add one in{" "}
          <Link href="/classes" className="text-primary hover:underline">
            Classes &amp; Arms
          </Link>{" "}
          first.
        </p>
      )}

      {!sessionName && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          No academic term is marked current, so the enrolment can&rsquo;t be created.
          Set one in{" "}
          <Link href="/settings/sessions" className="text-primary hover:underline">
            Sessions &amp; Terms
          </Link>{" "}
          first.
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending || !hasArms || !sessionName}
        className="w-full h-11 font-semibold"
      >
        {isPending ? "Creating student…" : "Create student"}
      </Button>
    </form>
  );
}
