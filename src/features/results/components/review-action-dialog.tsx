"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  label: string;
  placeholder: string;
  confirmLabel: string;
  // Reject and unlock both require text server-side; approve accepts an
  // optional comment. Making that explicit here keeps the button honest about
  // whether it can be pressed yet.
  required: boolean;
  isPending: boolean;
  onConfirm: (text: string) => Promise<unknown>;
  destructive?: boolean;
}

// Shared by reject, unlock and approve-with-comment. All three are a decision
// plus a note explaining it — the note is the point, since it's what the teacher
// reads next, so it gets a real field rather than a prompt().
export function ReviewActionDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  confirmLabel,
  required,
  isPending,
  onConfirm,
  destructive,
}: Props) {
  const [text, setText] = useState("");

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (next) setText("");
  }

  async function confirm() {
    if (required && !text.trim()) return;
    try {
      await onConfirm(text.trim());
      onOpenChange(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-n-500">{description}</p>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              {label}
              {required && <span className="ml-1 text-clay">*</span>}
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={confirm}
            disabled={isPending || (required && !text.trim())}
            className={destructive ? "bg-clay text-white hover:bg-clay/90" : undefined}
          >
            {isPending ? "Saving…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
