"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { formatNaira } from "@/lib/text/format-naira";

import { waiverSchema, type WaiverFormValues } from "../schemas/waiver-schema";

interface Props {
  trigger: React.ReactNode;
  feeName: string;
  studentName: string;
  amount: number;
  paid: number;
  isPending?: boolean;
  onSave: (values: WaiverFormValues) => Promise<unknown>;
}

// Waives one fee in full for one student. There is no partial or percentage
// discount anywhere in the fees model — a half-price fee is a separate fee item,
// not a waiver.
export function WaiveFeeDialog({
  trigger,
  feeName,
  studentName,
  amount,
  paid,
  isPending,
  onSave,
}: Props) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WaiverFormValues>({
    resolver: zodResolver(waiverSchema),
    defaultValues: { reason: "" },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset({ reason: "" });
  }

  async function submit(values: WaiverFormValues) {
    try {
      // The backend takes reason as optional; an empty box means "no reason
      // given" rather than an empty string in the audit trail.
      await onSave({ reason: values.reason.trim() });
      setOpen(false);
    } catch {
      // Already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Waive {feeName}?</DialogTitle>
        </DialogHeader>
        <div className="-mt-1 space-y-1.5 text-sm text-n-500">
          <p>
            {studentName} stops owing the full {formatNaira(amount)} for this fee. It&rsquo;s all
            or nothing — there are no partial discounts.
          </p>
          {/* Money already taken is not refunded by waiving. The ledger row will
              show ₦0 balance while the payment stays on the student's history,
              which is confusing if nobody said so first. */}
          {paid > 0 && (
            <p className="rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 text-ink">
              {formatNaira(paid)} has already been paid against this fee. Waiving won&rsquo;t
              refund it — that&rsquo;s handled outside SchoolOS.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="waiver-reason">Reason (optional)</Label>
            <textarea
              id="waiver-reason"
              rows={3}
              placeholder="e.g. Staff child, scholarship, hardship"
              aria-invalid={!!errors.reason || undefined}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base text-ink outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm"
              {...register("reason")}
            />
            {errors.reason ? (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            ) : (
              <p className="text-xs text-n-400">Recorded against your name in the audit log.</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Waiving…" : "Waive fee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
