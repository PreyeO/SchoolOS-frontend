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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { feeItemSchema, type FeeItemFormValues } from "../schemas/fee-item-schema";

interface Props {
  trigger: React.ReactNode;
  title: string;
  // Named so the copy can say which class and term this lands on — the form
  // itself has no picker for either, and creating a fee against the wrong term
  // is invisible until nobody's balance moves.
  context: string;
  submitLabel: string;
  initialValues?: FeeItemFormValues;
  isPending?: boolean;
  onSave: (values: FeeItemFormValues) => Promise<unknown>;
}

const BLANK: FeeItemFormValues = { name: "", amount: 0 };

// Create and edit share one form: both write exactly name + amount, and the
// backend's create and update serializers validate them identically.
export function FeeItemDialog({
  trigger,
  title,
  context,
  submitLabel,
  initialValues,
  isPending,
  onSave,
}: Props) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeeItemFormValues>({
    resolver: zodResolver(feeItemSchema),
    defaultValues: initialValues ?? BLANK,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(initialValues ?? BLANK);
  }

  async function submit(values: FeeItemFormValues) {
    try {
      await onSave(values);
      setOpen(false);
    } catch {
      // Already toasted by the mutation. The dialog stays open so a rejected
      // duplicate name can be corrected without retyping the amount.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-sm text-n-500">{context}</p>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fee-item-name">Fee name</Label>
            <Input
              id="fee-item-name"
              placeholder="e.g. Tuition"
              aria-invalid={!!errors.name || undefined}
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fee-item-amount">Amount (₦)</Label>
            <Input
              id="fee-item-amount"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              placeholder="50000"
              aria-invalid={!!errors.amount || undefined}
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
