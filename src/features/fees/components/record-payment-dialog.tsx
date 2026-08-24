"use client";

import { useMemo, useState } from "react";
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
import { Select } from "@/components/ui/select";
import { formatNaira } from "@/lib/text/format-naira";

import { MANUAL_PAYMENT_METHODS } from "../lib/payment-methods";
import { buildPaymentSchema, type PaymentFormValues } from "../schemas/payment-schema";

interface Props {
  trigger: React.ReactNode;
  feeName: string;
  studentName: string;
  amount: number;
  paid: number;
  remaining: number;
  isPending?: boolean;
  onSave: (values: PaymentFormValues) => Promise<unknown>;
}

// One payment against one fee item. Never a lump sum: a parent settling tuition
// and PTA in one visit is two entries and two receipts, because that's the only
// shape the backend stores and the only one a receipt can itemise.
export function RecordPaymentDialog({
  trigger,
  feeName,
  studentName,
  amount,
  paid,
  remaining,
  isPending,
  onSave,
}: Props) {
  const [open, setOpen] = useState(false);
  const schema = useMemo(() => buildPaymentSchema(remaining), [remaining]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(schema),
    // Prefilled with the full remainder: paying off the balance is the common
    // case, and a part-payment is a deliberate edit rather than the default.
    defaultValues: { amount: remaining, method: "cash" },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset({ amount: remaining, method: "cash" });
  }

  async function submit(values: PaymentFormValues) {
    try {
      await onSave(values);
      setOpen(false);
    } catch {
      // Already toasted. Staying open matters here — a rejection is usually the
      // concurrent-payment race, and the amount needs correcting, not retyping.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
        </DialogHeader>
        <div className="-mt-1 space-y-0.5 text-sm text-n-500">
          <p>
            {feeName} · {studentName}
          </p>
          <p>
            {formatNaira(amount)} billed
            {paid > 0 && <> · {formatNaira(paid)} already paid</>} ·{" "}
            <span className="font-medium text-ink">{formatNaira(remaining)} outstanding</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="payment-amount">Amount received (₦)</Label>
            <Input
              id="payment-amount"
              type="number"
              inputMode="numeric"
              min={1}
              max={remaining}
              step={1}
              aria-invalid={!!errors.amount || undefined}
              {...register("amount", { valueAsNumber: true })}
            />
            {/* Overpayment is refused outright rather than banked as credit —
                there is no credit balance anywhere in this platform. */}
            {errors.amount ? (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            ) : (
              <p className="text-xs text-n-400">Can&rsquo;t exceed what&rsquo;s outstanding.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-method">How was it received?</Label>
            <Select
              id="payment-method"
              aria-invalid={!!errors.method || undefined}
              {...register("method")}
            >
              {MANUAL_PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
            {errors.method && <p className="text-xs text-destructive">{errors.method.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Recording…" : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
