"use client";

import { useState } from "react";

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

interface Props {
  trigger: React.ReactNode;
  title: string;
  label: string;
  initialValue: string;
  isPending?: boolean;
  onSave: (name: string) => Promise<unknown>;
}

// One generic single-field edit dialog, reused for session-name edit,
// class-name edit, arm-name edit, and add-arm — all structurally identical
// (one text input, Cancel/Save). onSave is expected to reject on failure (the
// mutation's own onError already toasts it) so the dialog can stay open for
// a retry instead of closing on a failed save.
export function EditNameDialog({ trigger, title, label, initialValue, isPending, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setValue(initialValue);
      setError(null);
    }
  }

  async function submit() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Required");
      return;
    }
    try {
      await onSave(trimmed);
      setOpen(false);
    } catch {
      // Error already toasted by the mutation — keep the dialog open to retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <FieldWrapper id="edit-name" label={label} error={error ?? undefined}>
          <Input
            id="edit-name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={!!error}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
          />
        </FieldWrapper>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
