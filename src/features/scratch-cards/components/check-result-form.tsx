"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/api/get-error-message";

import { useCheckPeriods } from "../hooks/use-result-check";
import { formatPinInput, formatSerialInput, SERIAL_LENGTH } from "../lib/format-serial";
import { checkResultSchema, type CheckResultInput, type CheckResultValues } from "../schemas/check-result-schema";
import { CheckSteps } from "./check-steps";
import { TermPicker } from "./term-picker";

interface Props {
  onCheck: (values: CheckResultValues) => void;
  isChecking: boolean;
  checkError: unknown;
  // From "Check another term": the same card and child, term to choose again.
  initial?: Omit<CheckResultValues, "academic_period_id">;
}

const BIG = "h-12 text-lg md:text-lg";

// Serial first: a card's terms belong to the session it was bought for, and a
// parent doesn't know a term's id. The PIN is only asked for once the card is
// recognised, so a mistyped serial doesn't cost one of the card's five tries.
export function CheckResultForm({ onCheck, isChecking, checkError, initial }: Props) {
  const [serial, setSerial] = useState<string | null>(initial?.serial ?? null);
  const [showPin, setShowPin] = useState(false);
  const periods = useCheckPeriods(serial);

  const { control, register, handleSubmit, getValues, setError, formState: { errors } } = useForm<
    CheckResultInput,
    unknown,
    CheckResultValues
  >({
    resolver: zodResolver(checkResultSchema),
    defaultValues: { serial: "", pin: "", admission_number: "", academic_period_id: "", ...initial },
  });

  function findCard() {
    const value = getValues("serial");
    if (value.length !== SERIAL_LENGTH) {
      setError("serial", { message: "A serial has 10 letters and numbers, like ABCD-EFGH-IJ" });
      return;
    }
    setSerial(value);
  }

  const found = !!serial && periods.isSuccess;

  return (
    <form noValidate onSubmit={handleSubmit(onCheck)} className="space-y-5">
      <CheckSteps current={found ? 2 : 1} />

      <div className="space-y-1.5">
        <Label htmlFor="check-serial">Card serial number</Label>
        <Controller
          control={control}
          name="serial"
          render={({ field }) => (
            <Input
              id="check-serial"
              {...field}
              onChange={(e) => {
                field.onChange(formatSerialInput(e.target.value));
                setSerial(null); // the terms were for the previous serial
              }}
              placeholder="ABCD-EFGH-IJ"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={!!errors.serial || undefined}
              className={`${BIG} font-mono tracking-widest`}
            />
          )}
        />
        {errors.serial && <p className="text-xs text-destructive">{errors.serial.message}</p>}
      </div>

      {!found ? (
        <>
          {periods.isError && <p role="alert" className="text-sm text-clay">{getErrorMessage(periods.error)}</p>}
          <Button type="button" onClick={findCard} disabled={!!serial && periods.isPending} className="h-12 w-full text-base">
            {serial && periods.isPending ? "Finding your card…" : "Continue"}
          </Button>
        </>
      ) : (
        <>
          <p className="rounded-lg bg-primary/5 px-3 py-2 text-sm text-ink">
            Card for the <span className="font-semibold">{periods.data.session_name}</span> session
          </p>
          <Controller
            control={control}
            name="academic_period_id"
            render={({ field }) => (
              <TermPicker periods={periods.data.periods} value={field.value} onChange={field.onChange} error={errors.academic_period_id?.message} />
            )}
          />
          <div className="space-y-1.5">
            <Label htmlFor="check-admission">Admission number</Label>
            <Input id="check-admission" {...register("admission_number")} autoComplete="off" className={BIG} aria-invalid={!!errors.admission_number || undefined} />
            {errors.admission_number && <p className="text-xs text-destructive">{errors.admission_number.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="check-pin">PIN</Label>
            <div className="relative">
              <Controller
                control={control}
                name="pin"
                render={({ field }) => (
                  <Input
                    id="check-pin"
                    {...field}
                    onChange={(e) => field.onChange(formatPinInput(e.target.value))}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="10 digits"
                    aria-invalid={!!errors.pin || undefined}
                    className={`${BIG} pr-12 font-mono tracking-[0.25em]`}
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-n-400 hover:text-ink"
              >
                {showPin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.pin && <p className="text-xs text-destructive">{errors.pin.message}</p>}
          </div>
          {checkError ? <p role="alert" className="rounded-lg border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-ink">{getErrorMessage(checkError)}</p> : null}
          <Button type="submit" disabled={isChecking} className="h-12 w-full text-base">
            {isChecking ? "Checking…" : "Check result"}
          </Button>
          <p className="text-center text-xs text-n-400">Five wrong PINs lock the card for good.</p>
        </>
      )}
    </form>
  );
}
