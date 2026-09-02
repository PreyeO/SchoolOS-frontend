"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ColorPicker } from "@/components/shared/color-picker";
import { ImageUploadField } from "@/features/uploads/components/image-upload-field";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { contrastRatio } from "@/lib/contrast";

import { brandingSchema, type BrandingFormValues } from "../../schemas/branding-schema";
import { useEditBranding } from "../../hooks/use-branding-edit";
import type { SchoolResponse } from "../../types";

interface Props {
  school: SchoolResponse;
  trigger: React.ReactNode;
}

function defaultsFrom(school: SchoolResponse): BrandingFormValues {
  return {
    // undefined so an untouched logo is omitted from the PATCH — this field
    // holds an S3 key, and school.logo is a presigned read URL, not one.
    logo_key: undefined,
    primary_color: school.primary_color,
    accent_color: school.accent_color,
    motto: school.motto ?? "",
  };
}

export function EditBrandingDialog({ school, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { mutateAsync, isPending } = useEditBranding();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandingFormValues>({ resolver: zodResolver(brandingSchema), defaultValues: defaultsFrom(school) });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(defaultsFrom(school));
  }

  const [primary, accent] = useWatch({ control, name: ["primary_color", "accent_color"] });
  const lowContrast = contrastRatio(primary, accent) < 1.5;

  async function submit(values: BrandingFormValues) {
    try {
      await mutateAsync(values);
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit branding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
          <FieldWrapper id="edit-logo_key" label="School logo" error={errors.logo_key?.message}>
            <Controller
              name="logo_key"
              control={control}
              render={({ field }) => (
                <ImageUploadField
                  id="edit-logo_key"
                  prefix="school-logos"
                  label="logo"
                  currentUrl={school.logo}
                  onChange={field.onChange}
                  onUploadingChange={setUploading}
                />
              )}
            />
          </FieldWrapper>

          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">Primary colour</p>
            <Controller
              name="primary_color"
              control={control}
              render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} label="Primary colour" />}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">Accent colour</p>
            <Controller
              name="accent_color"
              control={control}
              render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} label="Accent colour" />}
            />
          </div>

          {lowContrast && (
            <p className="text-xs text-clay" role="status">
              These two colours look very similar — consider more contrast between them.
            </p>
          )}

          <FieldWrapper id="edit-motto" label="School motto" hint="Optional" error={errors.motto?.message}>
            <Input id="edit-motto" placeholder="For humankind!" {...register("motto")} />
          </FieldWrapper>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || uploading}>
              {uploading ? "Uploading…" : isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
