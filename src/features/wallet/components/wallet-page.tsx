"use client";

import { ErrorState } from "@/components/shared/error-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNaira } from "@/lib/text/format-naira";

import { useWallet } from "../hooks/use-wallet-queries";
import { formatCredits } from "../lib/describe-transaction";
import { TopUpForm } from "./top-up-form";
import { TopUpsList } from "./top-ups-list";
import { TransactionsList } from "./transactions-list";

// /settings/payments. The school's SMS credit balance: bought here through
// Paystack or Flutterwave, spent when SchoolOS texts on the school's behalf (today, result
// card PINs). Gated on manage_wallet by the nav registry.
export function WalletPage() {
  const { data: wallet, isPending, isError, error } = useWallet();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">SMS Wallet</h1>
        <p className="mt-1 max-w-2xl text-sm text-n-500">
          Credits pay for the texts SchoolOS sends for your school, such as result card PINs to parents. One credit is
          one SMS page: 160 plain characters, or 70 when the text has an apostrophe, accent or other special character
          (common in names). So a single text can cost 2 credits. Printing PINs costs nothing.
        </p>
      </div>

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading wallet…</p>
      ) : isError ? (
        <ErrorState error={error} resourceLabel="the SMS wallet" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <section className="rounded-xl border border-n-200 bg-white p-5" aria-labelledby="wallet-balance">
            <h2 id="wallet-balance" className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">
              Balance
            </h2>
            <p className="mt-2 font-display text-4xl font-bold tabular-nums text-ink" aria-live="polite">
              {wallet.balance.toLocaleString("en-NG")}
            </p>
            <p className="mt-1 text-sm text-n-500">
              {wallet.balance === 0
                ? "No credits yet. Top up to start texting parents."
                : `${formatCredits(wallet.balance)}, worth ${formatNaira(wallet.balance * wallet.credit_price)} at today's price.`}
            </p>
          </section>

          <section className="rounded-xl border border-n-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Buy credits</h2>
            <TopUpForm wallet={wallet} />
          </section>
        </div>
      )}

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="topups">Top-ups</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="pt-3">
          <TransactionsList />
        </TabsContent>
        <TabsContent value="topups" className="pt-3">
          <TopUpsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
