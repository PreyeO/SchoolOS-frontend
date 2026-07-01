"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { DEFAULT_PRIMARY_COLOR } from "@/data/color-presets";
import { useSchoolStore } from "@/stores/school-store";

import { brandingSchema, type BrandingFormValues } from "../schemas/branding-schema";
import { useUpdateBranding } from "../hooks/use-update-branding";
import { ColorPicker } from "./color-picker";
import { LogoUploader } from "./logo-uploader";

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

export function StepBranding({ onNext, onSkip }: Props) {
  const school = useSchoolStore((s) => s.currentSchool);
  const { mutate, isPending } = useUpdateBranding();

  const { control, handleSubmit, formState: { errors } } = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      primary_color: school?.primaryColor ?? DEFAULT_PRIMARY_COLOR,
      logo: null,
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => mutate(v, { onSuccess: onNext }))} noValidate className="space-y-8">
      <div className="space-y-2">
        <p className="font-medium text-ink">School logo</p>
        <p className="text-sm text-n-500">A square image works best (PNG or JPG, at least 200×200 px).</p>
        <Controller
          name="logo"
          control={control}
          render={({ field }) => (
            <LogoUploader value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="space-y-3">
        <p className="font-medium text-ink">Brand colour</p>
        <p className="text-sm text-n-500">Used throughout your school dashboard.</p>
        <Controller
          name="primary_color"
          control={control}
          render={({ field }) => (
            <ColorPicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.primary_color && (
          <p className="text-xs text-red-600">{errors.primary_color.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold"
        >
          {isPending ? "Saving…" : "Save & continue"}
        </Button>
        <Button type="button" variant="ghost" onClick={onSkip} disabled={isPending}>
          Skip
        </Button>
      </div>
    </form>
  );
}
