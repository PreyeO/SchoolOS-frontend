"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface BaseProps {
  id: string;
  label: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
  hint?: string;
}

function Wrapper({
  id,
  label,
  error,
  hint,
  children,
}: Omit<BaseProps, "registration"> & { children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error.message}</p>
      ) : hint ? (
        <p className="text-xs text-n-400">{hint}</p>
      ) : null}
    </div>
  );
}

// Every field on the student edit form goes through one of these three, so the
// label/error/hint arrangement can't drift between the eighteen of them.

export function TextField({ type = "text", ...props }: BaseProps & { type?: string }) {
  return (
    <Wrapper {...props}>
      <Input
        id={props.id}
        type={type}
        aria-invalid={!!props.error || undefined}
        {...props.registration}
      />
    </Wrapper>
  );
}

export function SelectField({
  options,
  placeholder,
  ...props
}: BaseProps & { options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <Wrapper {...props}>
      <Select id={props.id} aria-invalid={!!props.error || undefined} {...props.registration}>
        {/* Present only on optional fields — an empty option on a required one
            would offer a value the form then rejects. */}
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Wrapper>
  );
}

export function TextAreaField({ rows = 2, ...props }: BaseProps & { rows?: number }) {
  return (
    <Wrapper {...props}>
      <textarea
        id={props.id}
        rows={rows}
        aria-invalid={!!props.error || undefined}
        className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base text-ink outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm"
        {...props.registration}
      />
    </Wrapper>
  );
}
