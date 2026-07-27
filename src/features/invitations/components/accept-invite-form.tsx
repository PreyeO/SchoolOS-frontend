"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { PasswordInput } from "@/features/auth/components/password-input";

import { acceptInviteSchema, type AcceptInviteFormValues } from "../schemas/accept-invite-schema";

interface Props {
  isPending: boolean;
  onSubmit: (values: AcceptInviteFormValues) => void;
}

export function AcceptInviteForm({ isPending, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FieldWrapper id="password" label="Create a password" error={errors.password?.message} required>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          hasError={!!errors.password}
          describedBy={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
      </FieldWrapper>

      <FieldWrapper
        id="confirm_password"
        label="Confirm password"
        error={errors.confirm_password?.message}
        required
      >
        <PasswordInput
          id="confirm_password"
          autoComplete="new-password"
          hasError={!!errors.confirm_password}
          describedBy={errors.confirm_password ? "confirm_password-error" : undefined}
          {...register("confirm_password")}
        />
      </FieldWrapper>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-amber hover:bg-amber/90 text-ink font-semibold text-base"
      >
        {isPending ? "Setting up your account…" : "Accept invite & continue"}
      </Button>
    </form>
  );
}
