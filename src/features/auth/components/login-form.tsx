"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { loginSchema, type LoginFormValues } from "../schemas/login-schema";
import { FieldWrapper } from "./field-wrapper";
import { PasswordInput } from "./password-input";

interface LoginFormProps {
  defaultIdentifier?: string;
  isPending: boolean;
  onSubmit: (values: LoginFormValues) => void;
}

export function LoginForm({ defaultIdentifier, isPending, onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: defaultIdentifier ?? "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FieldWrapper
        id="identifier"
        label="Email or admission number"
        error={errors.identifier?.message}
        required
      >
        <Input
          id="identifier"
          autoComplete="username"
          aria-invalid={!!errors.identifier}
          aria-describedby={errors.identifier ? "identifier-error" : undefined}
          {...register("identifier")}
        />
      </FieldWrapper>

      <FieldWrapper id="password" label="Password" error={errors.password?.message} required>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          hasError={!!errors.password}
          describedBy={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
      </FieldWrapper>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-brand hover:text-brand/80 underline underline-offset-4"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-amber hover:bg-amber/90 text-ink font-semibold text-base"
      >
        {isPending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
