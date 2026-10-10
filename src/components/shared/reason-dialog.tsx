"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  // Extra fields above the reason, e.g. the status picker. The dialog owns
  // only the reason; anything else is the caller's state.
  children?: React.ReactNode;
  reasonPlaceholder?: string;
  confirmLabel: string;
  pendingLabel?: string;
  destructive?: boolean;
  isPending: boolean;
  // A caller-side precondition beyond "reason given", e.g. a status chosen.
  canConfirm?: boolean;
  // Resolve to close; reject to stay open with what was typed (the mutation
  // has already toasted the error).
  onConfirm: (reason: string) => Promise<unknown>;
  onOpenChange?: (open: boolean) => void;
}

// A confirmation that must carry a written reason. Every lifecycle action the
// backend audits this way — status changes and the three offboards — rejects
// a blank reason with a 400, and the reason is what the audit log keeps, so
// the field is required here rather than left to fail on submit.
export function ReasonDialog({
  trigger,
  title,
  description,
  children,
  reasonPlaceholder,
  confirmLabel,
  pendingLabel = "Saving…",
  destructive = false,
  isPending,
  canConfirm = true,
  onConfirm,
  onOpenChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const fieldId = useId();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setReason("");
    onOpenChange?.(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await onConfirm(reason.trim());
      handleOpenChange(false);
    } catch {
      // Already toasted; keep the dialog and the typed reason.
    }
  }

  const ready = canConfirm && reason.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription asChild><div>{description}</div></DialogDescription>}
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-4">
          {children}
          <div className="space-y-1.5">
            <Label htmlFor={fieldId}>Reason</Label>
            <textarea
              id={fieldId}
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base text-ink outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            />
            <p className="text-xs text-n-400">Recorded in the audit log.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={!ready || isPending}>
              {isPending ? pendingLabel : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
