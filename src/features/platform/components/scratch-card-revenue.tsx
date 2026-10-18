import Link from "next/link";

import { formatNaira } from "@/lib/text/format-naira";

import type { SchoolFinancialRow } from "../types";

// Scratch-card money, kept visibly apart from the subscription projection:
// this is collected through Paystack, that is an estimate. Only schools that
// have bought cards are listed, most revenue first.
export function ScratchCardRevenue({ rows, total }: { rows: SchoolFinancialRow[]; total: number }) {
  const buyers = rows
    .filter((r) => r.scratch_cards_sold > 0)
    .sort((a, b) => b.scratch_card_revenue - a.scratch_card_revenue);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Scratch cards</h2>
          <p className="text-xs text-n-500">Collected through Paystack. Unlike the projection above, this is real money.</p>
        </div>
        <p className="font-display text-xl font-bold tabular-nums text-ink">{formatNaira(total)}</p>
      </div>

      {buyers.length === 0 ? (
        <p className="text-sm text-n-400 italic">No school has bought scratch cards yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
                <th className="px-3 py-2.5 font-medium">School</th>
                <th className="px-3 py-2.5 text-right font-medium">Sold</th>
                <th className="px-3 py-2.5 text-right font-medium">Used</th>
                <th className="px-3 py-2.5 text-right font-medium">Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {buyers.map((row) => (
                <tr key={row.school.id}>
                  <td className="px-3 py-2.5">
                    <Link href={`/platform/schools/${row.school.id}`} className="font-medium text-ink hover:underline">
                      {row.school.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-n-500">{row.scratch_cards_sold}</td>
                  {/* Can exceed Sold: a used card that was later replaced counts, and so does its replacement. */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-n-500">{row.scratch_cards_activated}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-ink">{formatNaira(row.scratch_card_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
