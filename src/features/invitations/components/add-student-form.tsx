"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ArmPicker } from "@/components/shared/arm-picker";
import { buildArmOptions } from "@/lib/school/arm-options";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { EnrolmentBlockers } from "./enrolment-blockers";
import { StudentIdentityFields } from "./student-identity-fields";
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
      <StudentIdentityFields register={register} errors={errors} />

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

      <EnrolmentBlockers
        hasArms={classesLoading ? undefined : hasArms}
        sessionName={sessionName}
      />

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
