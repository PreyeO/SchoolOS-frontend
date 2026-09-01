"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath } from "react-hook-form";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SchoolLevel } from "@/features/auth/types";

import { useSubmitDemoRequest } from "../hooks/use-submit-demo-request";
import { normalisePhone } from "../lib/phone";
import { demoRequestSchema, type DemoRequestFormValues } from "../schemas/demo-request-schema";
import type { ContactTime, DemoRequestPayload, PilotRole, StudentRange } from "../types";
import { BookDemoProgress } from "./book-demo-progress";
import { BookDemoSchoolFields } from "./book-demo-school-fields";
import { BookDemoStepContact } from "./book-demo-step-contact";
import { BookDemoStepYou } from "./book-demo-step-you";

// Which fields each step owns, so Next validates only what's on screen.
const STEP_FIELDS: FieldPath<DemoRequestFormValues>[][] = [
  ["full_name", "role"],
  ["school_name", "state", "city", "levels", "student_range"],
  ["email", "phone_number", "message"],
];

export function BookDemoForm({ onDone }: { onDone: (firstName: string) => void }) {
  const { mutate, isPending } = useSubmitDemoRequest();
  const [step, setStep] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<DemoRequestFormValues>({
    resolver: zodResolver(demoRequestSchema),
    // +234 prefilled rather than a placeholder: it's the answer for almost
    // every visitor, and a placeholder would have to be retyped.
    defaultValues: { levels: [], phone_number: "+234" },
  });

  const isLast = step === STEP_FIELDS.length - 1;

  // A zod resolver validates the WHOLE schema on every pass — it can't check a
  // subset, because the schema is one object. So validating step 2 also
  // evaluates step 3's still-empty email and phone, and those errors reach
  // formState before the visitor has seen the fields: the step opened already
  // red, accusing them of not filling in something they'd never been shown.
  //
  // Cleared only the first time a step is reached. Coming back to a step you
  // genuinely got wrong keeps its errors, which is the useful behaviour.
  const furthestStep = useRef(0);

  async function next() {
    if (!(await trigger(STEP_FIELDS[step]))) return;
    const target = step + 1;
    if (target > furthestStep.current) {
      furthestStep.current = target;
      clearErrors(STEP_FIELDS[target]);
    }
    setStep(target);
  }

  function submit(values: DemoRequestFormValues) {
    const message = values.message?.trim();
    const payload: DemoRequestPayload = {
      full_name: values.full_name.trim(),
      role: values.role as PilotRole,
      school_name: values.school_name.trim(),
      state: values.state,
      city: values.city.trim(),
      levels: values.levels as SchoolLevel[],
      student_range: values.student_range as StudentRange,
      email: values.email.trim(),
      phone_number: normalisePhone(values.phone_number),
      ...(values.best_time_to_call
        ? { best_time_to_call: values.best_time_to_call as ContactTime }
        : {}),
      ...(message ? { message } : {}),
    };
    mutate(payload, { onSuccess: () => onDone(payload.full_name.split(" ")[0]) });
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <BookDemoProgress index={step} />

      {step === 0 && <BookDemoStepYou register={register} errors={errors} />}
      {step === 1 && (
        <BookDemoSchoolFields register={register} control={control} errors={errors} />
      )}
      {step === 2 && (
        <BookDemoStepContact register={register} errors={errors} />
      )}

      <div className="flex items-center gap-2 pt-1">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => setStep((s) => s - 1)}
            disabled={isPending}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        )}
        {/* type="button" on Next matters: a submit here would run the whole
            schema and surface errors for steps the visitor hasn't reached. */}
        {isLast ? (
          <Button type="submit" disabled={isPending} className="h-11 flex-1 font-semibold">
            {isPending ? "Sending…" : "Join the pilot"}
          </Button>
        ) : (
          <Button type="button" onClick={next} className="h-11 flex-1 font-semibold">
            Next
          </Button>
        )}
      </div>
    </form>
  );
}
