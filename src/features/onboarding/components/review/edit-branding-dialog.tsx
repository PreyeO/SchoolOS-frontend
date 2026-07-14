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
import { FieldWrapper } from "@/features/auth/components/field-wrapper";

import { brandingSchema, type BrandingFormValues } from "../../schemas/branding-schema";
import { useEditBranding } from "../../hooks/use-branding-edit";
import { contrastRatio } from "../../lib/contrast-ratio";
import { ColorPicker } from "../color-picker";
import { LogoUrlField } from "../logo-url-field";
import type { SchoolResponse } from "../../types";

interface Props {
  school: SchoolResponse;
  trigger: React.ReactNode;
}

function defaultsFrom(school: SchoolResponse): BrandingFormValues {
  return {
    logo: school.logo ?? "",
    primary_color: school.primary_color,
    accent_color: school.accent_color,
    motto: school.motto ?? "",
  };
}

export function EditBrandingDialog({ school, trigger }: Props) {
  const [open, setOpen] = useState(false);
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
          <FieldWrapper id="edit-logo" label="School logo" error={errors.logo?.message}>
            <Controller
              name="logo"
              control={control}
              render={({ field }) => (
                <LogoUrlField id="edit-logo" value={field.value ?? ""} onChange={field.onChange} hasError={!!errors.logo} />
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
