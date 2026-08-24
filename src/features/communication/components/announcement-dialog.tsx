"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { announcementSchema, type AnnouncementFormValues } from "../schemas/announcement-schema";
import { AudienceField } from "./audience-field";
import { RichTextEditor } from "./rich-text-editor";

interface Props {
  trigger: React.ReactNode;
  title: string;
  submitLabel: string;
  initialValues?: AnnouncementFormValues;
  isPending?: boolean;
  onSave: (values: AnnouncementFormValues) => Promise<unknown>;
}

const BLANK: AnnouncementFormValues = { title: "", body_html: "", audience_personas: [] };

// Compose and edit share one form — the create and update serializers validate
// identically, and update simply sends all three fields.
export function AnnouncementDialog({
  trigger,
  title,
  submitLabel,
  initialValues,
  isPending,
  onSave,
}: Props) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: initialValues ?? BLANK,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(initialValues ?? BLANK);
  }

  async function submit(values: AnnouncementFormValues) {
    try {
      await onSave(values);
      setOpen(false);
    } catch {
      // Already toasted by the mutation. Staying open keeps the drafted body
      // recoverable — there is no autosave to fall back on.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-sm text-n-500">
          This goes live as soon as you post it — there are no drafts.
        </p>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="announcement-title">Title</Label>
            <Input
              id="announcement-title"
              placeholder="e.g. Mid-term break dates"
              aria-invalid={!!errors.title || undefined}
              {...register("title")}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Notice</Label>
            <Controller
              control={control}
              name="body_html"
              render={({ field }) => (
                // key remounts the editor when the dialog reopens: TipTap owns
                // its document after mount and ignores later `content` changes,
                // so without this an edit would show the previous notice's body.
                <RichTextEditor
                  key={open ? "open" : "closed"}
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.body_html}
                  ariaLabel="Notice body"
                />
              )}
            />
            {errors.body_html && (
              <p className="text-xs text-destructive">{errors.body_html.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Who sees this?</Label>
            <Controller
              control={control}
              name="audience_personas"
              render={({ field }) => (
                <AudienceField
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.audience_personas}
                />
              )}
            />
            {errors.audience_personas && (
              <p className="text-xs text-destructive">{errors.audience_personas.message}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Posting…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
