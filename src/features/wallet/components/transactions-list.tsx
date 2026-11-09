"use client";

import { useState } from "react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Select } from "@/components/ui/select";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useWalletTransactions } from "../hooks/use-wallet-queries";
import { TRANSACTION_TABS, describeTransaction, formatSignedCredits } from "../lib/describe-transaction";
import type { WalletTransactionType } from "../types";

// The ledger, newest first, filtered on the server by type. One list layout
// at every width: each row is two short lines, so it never needed a table.
export function TransactionsList() {
  const [type, setType] = useState<WalletTransactionType | "all">("all");
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useWalletTransactions(page, type === "all" ? undefined : type);

  return (
    <div className="space-y-3">
      <Select
        aria-label="Show activity"
        value={type}
        onChange={(e) => {
          setType(e.target.value as WalletTransactionType | "all");
          setPage(1);
        }}
        className="h-9 w-full sm:w-48"
      >
        {TRANSACTION_TABS.map((tab) => (
          <option key={tab.value} value={tab.value}>{tab.label}</option>
        ))}
      </Select>

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading activity…</p>
      ) : isError ? (
        <p className="text-sm text-clay">Couldn&rsquo;t load wallet activity. Refresh to try again.</p>
      ) : data.results.length === 0 ? (
        <p className="text-sm text-n-400 italic">
          {type === "all" ? "No activity yet. Top-ups and texts will be listed here." : "Nothing of this kind yet."}
        </p>
      ) : (
        <>
          <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
            {data.results.map((tx) => {
              const { label, detail } = describeTransaction(tx);
              return (
                <li key={tx.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-medium text-ink">{label}</p>
                    <p className="text-xs text-n-500 wrap-break-word">
                      {formatTimestamp(tx.created_at)}
                      {tx.created_by ? ` · ${tx.created_by.first_name} ${tx.created_by.last_name}` : ""}
                      {detail ? ` · ${detail}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`font-mono text-sm font-semibold tabular-nums ${tx.credits < 0 ? "text-ink" : "text-grass"}`}
                    >
                      {formatSignedCredits(tx.credits)}
                    </p>
                    <p className="font-mono text-[11px] tabular-nums text-n-400">
                      Balance {tx.balance_after.toLocaleString("en-NG")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <PaginationControls page={page} pageSize={25} count={data.count} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
