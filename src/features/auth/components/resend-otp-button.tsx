"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { useResendOtp } from "../hooks/use-resend-otp";

const COOLDOWN_SECONDS = 60;

interface ResendOtpButtonProps {
  email: string;
}

export function ResendOtpButton({ email }: ResendOtpButtonProps) {
  const [countdown, setCountdown] = useState(0);
  const { mutate, isPending } = useResendOtp();

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
