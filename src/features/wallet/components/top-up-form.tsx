"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { GatewayPicker } from "@/components/shared/gateway-picker";
import { Button } from "@/components/ui/button";
import { DEFAULT_GATEWAY, gatewayLabel, type PaymentGateway } from "@/lib/payments/gateways";
import { TextField } from "@/features/students/components/student-field";
import { formatNaira } from "@/lib/text/format-naira";

import { useStartTopUp } from "../hooks/use-wallet-mutations";
import { makeTopUpSchema, type TopUpValues } from "../schemas/top-up-schema";
import type { WalletSummary } from "../types";

// Common sizes, filtered to what the server's bounds allow.
const PRESETS = [100, 500, 1000, 5000];

// Credits in, naira quoted live. The server charges credits × credit_price and
// snapshots both, so the request never carries an amount.
export function TopUpForm({ wallet }: { wallet: WalletSummary }) {
  const start = useStartTopUp();
  const [gateway, setGateway] = useState<PaymentGateway>(DEFAULT_GATEWAY);
  const label = gatewayLabel(gateway);
  const presets = PRESETS.filter((n) => n >= wallet.min_topup_credits && n <= wallet.max_topup_credits);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<TopUpValues>({
    resolver: zodResolver(makeTopUpSchema(wallet.min_topup_credits, wallet.max_topup_credits)),
    defaultValues: { credits: presets[1] ?? wallet.min_topup_credits },
  });
  const credits = useWatch({ control, name: "credits" });
  const total = Number.isFinite(credits) && credits > 0 ? credits * wallet.credit_price : null;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((values) => start.mutate({ credits: values.credits, gateway }))}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id="topup-credits"
          label="Credits to buy"
          type="number"
          hint={`Between ${wallet.min_topup_credits.toLocaleString()} and ${wallet.max_topup_credits.toLocaleString()}.`}
          error={errors.credits}
          registration={register("credits", { valueAsNumber: true })}
        />
        {presets.length > 0 && (
          <div className="flex flex-wrap items-end gap-2 sm:pb-6">
            {presets.map((n) => (
              <Button
                key={n}
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={credits === n}
                className="tabular-nums aria-pressed:border-primary aria-pressed:bg-primary/5"
                onClick={() => setValue("credits", n, { shouldValidate: true })}
              >
                {n.toLocaleString()}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-n-50 px-4 py-3">
        <p className="text-sm text-n-600">{formatNaira(wallet.credit_price)} per credit</p>
        <p className="font-display text-lg font-bold tabular-nums text-ink">
          {total !== null ? formatNaira(total) : "—"}
        </p>
      </div>

      <GatewayPicker value={gateway} onChange={setGateway} disabled={start.isPending} />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={start.isPending || total === null}>
          {start.isPending ? `Opening ${label}…` : "Continue to payment"}
        </Button>
        <p className="text-xs text-n-400">
          You&rsquo;ll pay on {label}, then come back here. Credits are added once {label} confirms the payment.
        </p>
      </div>
    </form>
  );
}
