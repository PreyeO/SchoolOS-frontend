"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

import { FieldWrapper } from "./field-wrapper";
import { LevelsSelect } from "./levels-select";
import { SlugField } from "./slug-field";
import { StateSelect } from "./state-select";
import { createSchoolSchema, type CreateSchoolFormValues } from "../schemas/create-school-schema";
import { useCreateSchool } from "../hooks/use-create-school";
import type { SchoolLevel } from "../types";

function toSlug(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length > 2) {
    return words.map((w) => w[0].toLowerCase()).join("").replace(/[^a-z0-9]/g, "");
  }
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function Section({ children }: { children: React.ReactNode }) {
  return <section className="space-y-4">{children}</section>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-n-400">
      {children}
    </p>
  );
}

export function CreateSchoolForm() {
  const email = useAuthStore((s) => s.pendingVerificationEmail);
  const { mutate, isPending } = useCreateSchool();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateSchoolFormValues>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: { levels: [], email: email ?? "", phone_number: "+234" },
  });

  const nameValue = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!getValues("slug") && nameValue) setValue("slug", toSlug(nameValue));
  }, [nameValue, getValues, setValue]);

  return (
    <form onSubmit={handleSubmit((v) => mutate(v))} noValidate className="space-y-8">
      <Section>
        <SectionLabel>School details</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldWrapper id="name" label="School name" error={errors.name?.message} required>
            <Input id="name" autoComplete="organization" {...register("name")} />
          </FieldWrapper>
          <FieldWrapper id="slug" label="School URL" error={errors.slug?.message} required>
            <SlugField
              id="slug"
              hasError={!!errors.slug}
              placeholder="e.g. gcu"
              {...register("slug")}
            />
          </FieldWrapper>
        </div>
        <FieldWrapper
          id="email"
          label="School email"
          error={errors.email?.message}
          hint="This can be your personal email — you can update it later."
          required
        >
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
        </FieldWrapper>
      </Section>

      <Section>
        <SectionLabel>Levels your school runs</SectionLabel>
        <Controller
          name="levels"
          control={control}
          render={({ field }) => (
            <LevelsSelect
              value={(field.value as SchoolLevel[]) ?? []}
              onChange={(lvls) => field.onChange(lvls)}
              error={errors.levels?.message as string | undefined}
            />
          )}
        />
      </Section>

      <Section>
        <SectionLabel>Location</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldWrapper id="state" label="State" error={errors.state?.message} required>
            <StateSelect hasError={!!errors.state} {...register("state")} />
          </FieldWrapper>
          <FieldWrapper id="city" label="City" error={errors.city?.message} required>
            <Input id="city" {...register("city")} />
          </FieldWrapper>
        </div>
        <FieldWrapper id="address" label="Street address" error={errors.address?.message} required>
          <Input id="address" {...register("address")} />
        </FieldWrapper>
      </Section>

      <Section>
        <SectionLabel>Contact &amp; capacity</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldWrapper id="phone_number" label="School phone" error={errors.phone_number?.message} required>
            <Input id="phone_number" type="tel" inputMode="tel" {...register("phone_number")} />
          </FieldWrapper>
          <FieldWrapper id="student_capacity" label="Student capacity" error={errors.student_capacity?.message} required>
            <Input id="student_capacity" type="number" inputMode="numeric" min={1} {...register("student_capacity", { valueAsNumber: true })} />
          </FieldWrapper>
        </div>
      </Section>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-amber hover:bg-amber/90 text-ink font-semibold text-base"
      >
        {isPending ? "Creating school…" : "Create school"}
      </Button>
    </form>
  );
}
