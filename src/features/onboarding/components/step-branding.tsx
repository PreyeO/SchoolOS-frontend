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
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR } from "@/data/color-presets";
import { useSchoolStore } from "@/stores/school-store";
import type { StepKey } from "@/lib/school/onboarding-steps";
import { contrastRatio } from "@/lib/contrast";

import { brandingSchema, type BrandingFormValues } from "../schemas/branding-schema";
import { useUpdateBranding } from "../hooks/use-update-branding";
import { focusFirstError } from "../lib/first-error-field-id";

interface Props {
  onAdvanced: (step: StepKey) => void;
}

export function StepBranding({ onAdvanced }: Props) {
  const school = useSchoolStore((s) => s.currentSchool);
  const { save, isSaving, skip, isSkipping } = useUpdateBranding(onAdvanced);
  const [uploading, setUploading] = useState(false);

  const { control, register, handleSubmit, formState: { errors } } = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      // undefined, not the current URL: the form field now holds an S3 KEY, and
      // leaving it untouched must omit logo_key from the PATCH rather than
      // echo a read URL back as if it were one.
      logo_key: undefined,
      primary_color: school?.primaryColor ?? DEFAULT_PRIMARY_COLOR,
      accent_color: school?.accentColor ?? DEFAULT_ACCENT_COLOR,
      motto: school?.motto ?? "",
    },
  });

  const [primary, accent] = useWatch({ control, name: ["primary_color", "accent_color"] });
  const lowContrast = contrastRatio(primary, accent) < 1.5;

  function onInvalid(formErrors: FieldErrors<BrandingFormValues>) {
    focusFirstError(formErrors);
    const first = Object.values(formErrors)[0];
    toast.error((first?.message as string) ?? "Please check the form and try again.");
  }

  // Saving mid-upload would PATCH the previous key (or none), which reads as
  // the upload having quietly done nothing.
  const pending = isSaving || isSkipping || uploading;

  return (
    <form onSubmit={handleSubmit((v) => save(v), onInvalid)} noValidate className="space-y-8">
      <FieldWrapper id="logo_key" label="School logo" hint="Optional" error={errors.logo_key?.message}>
        <Controller
          name="logo_key"
          control={control}
          render={({ field }) => (
            <ImageUploadField
              id="logo_key"
              prefix="school-logos"
              label="logo"
              currentUrl={school?.logoUrl}
              onChange={field.onChange}
              onUploadingChange={setUploading}
            />
          )}
        />
      </FieldWrapper>

      <div className="space-y-3">
        <p id="primary-color-label" className="font-medium text-ink">Primary colour</p>
        <Controller
          name="primary_color"
          control={control}
          render={({ field }) => (
            <ColorPicker value={field.value} onChange={field.onChange} label="Primary colour" />
          )}
        />
      </div>

      <div className="space-y-3">
        <p id="accent-color-label" className="font-medium text-ink">Accent colour</p>
        <Controller
          name="accent_color"
          control={control}
          render={({ field }) => (
            <ColorPicker value={field.value} onChange={field.onChange} label="Accent colour" />
          )}
        />
      </div>

      {lowContrast && (
        <p className="text-xs text-clay" role="status">
          These two colours look very similar — consider more contrast between them for readability.
        </p>
      )}

      <FieldWrapper id="motto" label="School motto" hint="Optional" error={errors.motto?.message}>
        <Input id="motto" placeholder="For humankind!" {...register("motto")} />
      </FieldWrapper>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold">
          {uploading ? "Uploading…" : isSaving ? "Saving…" : "Save & continue"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => skip()} disabled={pending}>
          {isSkipping ? "Skipping…" : "Skip"}
        </Button>
      </div>
    </form>
  );
}
