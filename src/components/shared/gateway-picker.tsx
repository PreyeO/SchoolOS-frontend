"use client";

import { PAYMENT_GATEWAYS, type PaymentGateway } from "@/lib/payments/gateways";
import { cn } from "@/lib/utils";

interface Props {
  value: PaymentGateway;
  onChange: (next: PaymentGateway) => void;
  disabled?: boolean;
}

// Which provider to pay through. Real radios (not toggle buttons) so it's one
// tab stop with arrow-key movement, like any other single choice.
export function GatewayPicker({ value, onChange, disabled }: Props) {
  return (
    <fieldset disabled={disabled} className="space-y-1.5">
      <legend className="text-sm font-medium text-ink">Pay with</legend>
      <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
        {PAYMENT_GATEWAYS.map((g) => (
          <label
            key={g.id}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium",
              value === g.id ? "border-primary bg-primary/5 text-ink" : "border-n-200 bg-white text-n-600 hover:border-n-300",
            )}
          >
            <input
              type="radio"
              name="payment-gateway"
              value={g.id}
              checked={value === g.id}
              onChange={() => onChange(g.id)}
              className="size-4 accent-primary"
            />
            {g.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
