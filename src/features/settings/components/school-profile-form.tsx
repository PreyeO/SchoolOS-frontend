"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { FieldErrors } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/components/shared/color-picker";
import { ImageUploadField } from "@/features/uploads/components/image-upload-field";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { focusFirstError } from "@/features/onboarding/lib/first-error-field-id";
import { contrastRatio } from "@/lib/contrast";
import type { SchoolDetailResponse } from "@/lib/school/get-school-detail";

import { schoolProfileSchema, type SchoolProfileFormValues } from "../schemas/school-profile-schema";
import { useUpdateSchoolProfile } from "../hooks/use-update-school-profile";
import { BrandingPreview } from "./branding-preview";

export function SchoolProfileForm({ school }: { school: SchoolDetailResponse }) {
  const { mutate, isPending } = useUpdateSchoolProfile();
  const [uploading, setUploading] = useState(false);

  const { control, register, handleSubmit, formState: { errors } } = useForm<SchoolProfileFormValues>({
    resolver: zodResolver(schoolProfileSchema),
    defaultValues: {
      name: school.name,
      address: school.address,
      city: school.city,
      phone_number: school.phone_number,
      email: school.email,
      website: school.website ?? "",
      // undefined, not school.logo: this field holds an S3 KEY now, and an
      // untouched logo must be omitted from the PATCH rather than echoing the
      // read URL back as though it were one.
      logo_key: undefined,
      primary_color: school.primary_color,
      accent_color: school.accent_color,
      motto: school.motto ?? "",
    },
  });

  const [primary, accent] = useWatch({ control, name: ["primary_color", "accent_color"] });
  const lowContrast = contrastRatio(primary, accent) < 1.5;

  function onInvalid(formErrors: FieldErrors<SchoolProfileFormValues>) {
    focusFirstError(formErrors);
    const first = Object.values(formErrors)[0];
    toast.error((first?.message as string) ?? "Please check the form and try again.");
  }

  return (
    <form onSubmit={handleSubmit((v) => mutate(v), onInvalid)} noValidate className="space-y-6 max-w-2xl">
      <section className="space-y-5 rounded-xl border border-n-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">School details</h2>
        <FieldWrapper id="name" label="School name" error={errors.name?.message}>
          <Input id="name" {...register("name")} />
        </FieldWrapper>
        <FieldWrapper id="motto" label="School motto" hint="Optional" error={errors.motto?.message}>
          <Input id="motto" placeholder="For humankind!" {...register("motto")} />
        </FieldWrapper>
      </section>

      <section className="space-y-5 rounded-xl border border-n-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">Contact information</h2>
        <FieldWrapper id="address" label="Address" error={errors.address?.message}>
          <Input id="address" {...register("address")} />
        </FieldWrapper>
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldWrapper id="city" label="City" error={errors.city?.message}>
            <Input id="city" {...register("city")} />
          </FieldWrapper>
          <FieldWrapper id="phone_number" label="Phone number" error={errors.phone_number?.message}>
            <Input id="phone_number" {...register("phone_number")} />
          </FieldWrapper>
          <FieldWrapper id="email" label="Email" error={errors.email?.message}>
            <Input id="email" type="email" {...register("email")} />
          </FieldWrapper>
          <FieldWrapper id="website" label="Website" hint="Optional" error={errors.website?.message}>
            <Input id="website" placeholder="https://yourschool.com" {...register("website")} />
          </FieldWrapper>
        </div>
      </section>

      <section className="space-y-5 rounded-xl border border-n-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">Branding</h2>
        <FieldWrapper id="logo_key" label="School logo" hint="Optional" error={errors.logo_key?.message}>
          <Controller
            name="logo_key"
            control={control}
            render={({ field }) => (
              <ImageUploadField
                id="logo_key"
                prefix="school-logos"
                label="logo"
                currentUrl={school.logo}
                onChange={field.onChange}
                onUploadingChange={setUploading}
              />
            )}
          />
        </FieldWrapper>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="font-medium text-ink">Primary colour</p>
            <Controller
              name="primary_color"
              control={control}
              render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} label="Primary colour" />}
            />
          </div>
          <div className="space-y-3">
            <p className="font-medium text-ink">Accent colour</p>
            <Controller
              name="accent_color"
              control={control}
              render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} label="Accent colour" />}
            />
          </div>
        </div>

        {lowContrast && (
          <p className="text-xs text-clay" role="status">
            These two colours look very similar — consider more contrast between them for readability.
          </p>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-n-500">Preview</p>
          <BrandingPreview primary={primary} accent={accent} />
        </div>
      </section>

      {/* Disabled while bytes are in flight — saving then would PATCH the
          previous key, which reads as the upload having done nothing. */}
      <Button type="submit" disabled={isPending || uploading} className="font-semibold">
        {uploading ? "Uploading…" : isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
