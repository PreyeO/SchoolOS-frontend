"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { useResendPasswordReset } from "../hooks/use-resend-password-reset";

const COOLDOWN_SECONDS = 60;

interface Props {
  email: string;
}

export function ResendPasswordResetButton({ email }: Props) {
  const [countdown, setCountdown] = useState(0);
  const { mutate, isPending } = useResendPasswordReset();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleResend() {
    mutate(email, {
      onSuccess: () => setCountdown(COOLDOWN_SECONDS),
    });
  }

  const isDisabled = countdown > 0 || isPending;
  const label =
    countdown > 0
      ? `Resend in 0:${String(countdown).padStart(2, "0")}`
      : isPending
        ? "Sending…"
        : "Resend code";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isDisabled}
      onClick={handleResend}
      className="text-n-500 hover:text-ink text-sm"
    >
      {label}
    </Button>
  );
}
