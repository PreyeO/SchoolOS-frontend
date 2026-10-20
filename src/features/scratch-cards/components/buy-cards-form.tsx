"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/features/students/components/student-field";
import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";
import { formatNaira } from "@/lib/text/format-naira";
import { useSchoolStore } from "@/stores/school-store";

import { useStartCardPurchase } from "../hooks/use-scratch-card-mutations";
import { useCardPrice } from "../hooks/use-scratch-card-queries";
import { buyCardsSchema, type BuyCardsValues } from "../schemas/buy-cards-schema";

// Buying hands the admin to Paystack, and they come back to
// /scratch-cards/payment-complete to see the PINs. The total is quoted from the
// live price; the server snapshots it when the purchase is created.
export function BuyCardsForm() {
  const { data: sessions = [], isPending: sessionsPending, isError: sessionsError } = useAcademicSessions();
  const { data: unitPrice, isPending: pricePending, isError: priceError } = useCardPrice();
  const currentSessionName = useSchoolStore((s) => s.currentSchool?.sessionName);
  const start = useStartCardPurchase();

  // The current session first, since that's what nearly every purchase is for.
  const defaultSession = sessions.find((s) => s.name === currentSessionName) ?? sessions[0];

  const { register, handleSubmit, control, formState: { errors } } = useForm<BuyCardsValues>({
    resolver: zodResolver(buyCardsSchema),
    values: { academic_session_id: defaultSession?.id ?? "", quantity: 1 },
    resetOptions: { keepDirtyValues: true },
  });
  const quantity = useWatch({ control, name: "quantity" });
  const total = unitPrice !== undefined && Number.isFinite(quantity) && quantity > 0 ? unitPrice * quantity : null;

  // Loading and failure are not "no sessions": saying the school has none
  // while the list is merely slow, or unreachable, sends the admin off to
  // create a session that already exists.
  if (sessionsPending) {
    return <p className="text-sm text-n-400" role="status">Loading sessions…</p>;
  }
  if (sessionsError) {
    return <p className="text-sm text-clay">Couldn&rsquo;t load this school&rsquo;s sessions. Refresh to try again.</p>;
  }
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-n-500">
        Cards are bought for an academic session, and this school has none yet. Add one in Sessions &amp; Terms first.
      </p>
    );
  }

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((values) => start.mutate({ ...values, gateway: "paystack" }))}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          id="cards-session"
          label="Session"
          options={sessions.map((s) => ({ value: s.id, label: s.name }))}
          error={errors.academic_session_id}
          registration={register("academic_session_id")}
        />
        <TextField
          id="cards-quantity"
          label="Number of cards"
          type="number"
          hint="One card per student covers every term of the session."
          error={errors.quantity}
          registration={register("quantity", { valueAsNumber: true })}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-n-50 px-4 py-3">
        <p className="text-sm text-n-600">
          {pricePending
            ? "Loading price…"
            : priceError || unitPrice === undefined
              ? "Couldn't load the card price. Refresh to try again."
              : `${formatNaira(unitPrice)} per card`}
        </p>
        <p className="font-display text-lg font-bold tabular-nums text-ink">
          {total !== null ? formatNaira(total) : "—"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={start.isPending || total === null}>
          {start.isPending ? "Opening Paystack…" : "Continue to payment"}
        </Button>
        <p className="text-xs text-n-400">
          You&rsquo;ll pay on Paystack, then come back here to see and save the PINs.
        </p>
      </div>
    </form>
  );
}
