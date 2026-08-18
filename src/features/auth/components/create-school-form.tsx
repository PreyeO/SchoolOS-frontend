"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DuplicateSchoolNotice } from "./duplicate-school-notice";
import { FieldWrapper } from "./field-wrapper";
import { Section, SectionLabel } from "./form-section";
import { SchoolLocationFields } from "./school-location-fields";
import { LevelsSelect } from "./levels-select";
import { SlugField } from "./slug-field";
import { createSchoolSchema, type CreateSchoolFormValues } from "../schemas/create-school-schema";
import { useCreateSchool } from "../hooks/use-create-school";
import { useSchoolNameSearch } from "../hooks/use-school-name-search";
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


export function CreateSchoolForm() {
  const { mutate, isPending } = useCreateSchool();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateSchoolFormValues>({
    resolver: zodResolver(createSchoolSchema),
    // Don't prefill from the owner's personal email — they must enter a school
    // email by hand (or their own, deliberately, using the hint below).
    defaultValues: { levels: [], email: "", phone_number: "+234" },
  });

  // Auto-derive the slug from the name until the user edits the slug themselves.
  const slugEdited = useRef(false);
  const nameValue = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!slugEdited.current) setValue("slug", toSlug(nameValue ?? ""));
  }, [nameValue, setValue]);

  // Reuses the name already watched above for slug derivation.
  const { data: similarSchools } = useSchoolNameSearch(nameValue ?? "");

  const slugField = register("slug");

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
              {...slugField}
              onChange={(e) => {
                slugEdited.current = true;
                slugField.onChange(e);
              }}
            />
          </FieldWrapper>
        </div>
        <DuplicateSchoolNotice matches={similarSchools ?? []} />
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

      <SchoolLocationFields register={register} errors={errors} />

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
