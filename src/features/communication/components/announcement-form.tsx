"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AnnouncementFormValues } from "../schemas/announcement-schema";
import { AudienceField } from "./audience-field";
import { CategoryField } from "./category-field";
import { RichTextEditor } from "./rich-text-editor";

interface Props {
  register: UseFormRegister<AnnouncementFormValues>;
  control: Control<AnnouncementFormValues>;
  errors: FieldErrors<AnnouncementFormValues>;
  isPending?: boolean;
  submitLabel: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  // Flipped when the dialog opens, purely to remount the editor — see below.
  editorKey: string;
}

// The four fields, split out of AnnouncementDialog when the category picker
// pushed it past the 150-line limit. The dialog keeps the shell and the form
// state; this is only the layout.
export function AnnouncementForm({
  register,
  control,
  errors,
  isPending,
  submitLabel,
  onSubmit,
  editorKey,
}: Props) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
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
            // key remounts the editor when the dialog reopens: TipTap owns its
            // document after mount and ignores later `content` changes, so
            // without this an edit would show the previous notice's body.
            <RichTextEditor
              key={editorKey}
              value={field.value}
              onChange={field.onChange}
              hasError={!!errors.body_html}
              ariaLabel="Notice body"
            />
          )}
        />
        {errors.body_html && <p className="text-xs text-destructive">{errors.body_html.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>What kind of notice?</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => <CategoryField value={field.value} onChange={field.onChange} />}
        />
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
  );
}
