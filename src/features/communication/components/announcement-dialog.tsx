"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { announcementSchema, type AnnouncementFormValues } from "../schemas/announcement-schema";
import { AnnouncementForm } from "./announcement-form";

interface Props {
  trigger: React.ReactNode;
  title: string;
  submitLabel: string;
  initialValues?: AnnouncementFormValues;
  isPending?: boolean;
  onSave: (values: AnnouncementFormValues) => Promise<unknown>;
}

const BLANK: AnnouncementFormValues = {
  title: "",
  body_html: "",
  audience_personas: [],
  category: "general",
};

// Compose and edit share one form — the create and update serializers validate
// identically, and update simply sends all four fields.
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-sm text-n-500">
          This goes live as soon as you post it — there are no drafts.
        </p>

        <AnnouncementForm
          register={register}
          control={control}
          errors={errors}
          isPending={isPending}
          submitLabel={submitLabel}
          onSubmit={handleSubmit(submit)}
          editorKey={open ? "open" : "closed"}
        />
      </DialogContent>
    </Dialog>
  );
}
