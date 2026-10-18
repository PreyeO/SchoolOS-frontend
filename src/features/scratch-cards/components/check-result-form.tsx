"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/features/students/components/student-field";
import { getErrorMessage } from "@/lib/api/get-error-message";

import { useCheckPeriods } from "../hooks/use-result-check";
import { checkResultSchema, type CheckResultInput, type CheckResultValues } from "../schemas/check-result-schema";

interface Props {
  onCheck: (values: CheckResultValues) => void;
  isChecking: boolean;
  checkError: unknown;
}

// Two steps on one form. The serial comes first because the terms to choose
// from belong to the session that card was bought for, and a parent doesn't
// know a term's id; the PIN is only asked for once the card is recognised.
export function CheckResultForm({ onCheck, isChecking, checkError }: Props) {
  const [serial, setSerial] = useState<string | null>(null);
  const periods = useCheckPeriods(serial);

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm<
    CheckResultInput,
    unknown,
    CheckResultValues
  >({
    resolver: zodResolver(checkResultSchema),
    defaultValues: { serial: "", pin: "", admission_number: "", academic_period_id: "" },
  });

  async function findCard() {
    if (await trigger("serial")) setSerial(getValues("serial").trim().toUpperCase());
  }

  const serialField = register("serial", {
    // Editing the serial after a lookup starts over: the terms were for that card.
    onChange: () => setSerial(null),
  });

  return (
    <form noValidate onSubmit={handleSubmit(onCheck)} className="space-y-4">
      <TextField id="check-serial" label="Card serial number" error={errors.serial} registration={serialField} />

      {!serial || periods.isError ? (
        <>
          {periods.isError && <p role="alert" className="text-sm text-clay">{getErrorMessage(periods.error)}</p>}
          <Button type="button" onClick={findCard} className="w-full">Continue</Button>
        </>
      ) : periods.isPending ? (
        <p className="text-sm text-n-400" role="status">Finding your card…</p>
      ) : (
        <>
          <p className="text-sm text-n-500">
            Card for the <span className="font-medium text-ink">{periods.data.session_name}</span> session.
          </p>
          <SelectField
            id="check-term"
            label="Term"
            placeholder="Choose a term"
            options={periods.data.periods.map((p) => ({ value: p.id, label: p.name }))}
            error={errors.academic_period_id}
            registration={register("academic_period_id")}
          />
          <TextField
            id="check-admission"
            label="Student's admission number"
            error={errors.admission_number}
            registration={register("admission_number")}
          />
          <TextField id="check-pin" label="PIN" error={errors.pin} registration={register("pin")} />
          <p className="text-xs text-n-400">
            The card locks to the first student it&rsquo;s used for. Five wrong PINs lock it for good.
          </p>
          {checkError ? <p role="alert" className="text-sm text-clay">{getErrorMessage(checkError)}</p> : null}
          <Button type="submit" disabled={isChecking} className="w-full">
            {isChecking ? "Checking…" : "Check result"}
          </Button>
        </>
      )}
    </form>
  );
}
