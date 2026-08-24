"use client";

import { formatNaira } from "@/lib/text/format-naira";

import type { FeeItem } from "../types";
import { FeeItemRow } from "./fee-item-row";

interface Props {
  items: FeeItem[];
  context: string;
  canEdit: boolean;
}

// The class's bill for one term. The total counts active items only — that sum
// is what every student in this class actually owes, and a deactivated line
// contributes nothing to any balance.
export function FeeItemsTable({ items, context, canEdit }: Props) {
  const total = items.reduce((sum, item) => (item.is_active ? sum + item.amount : sum), 0);
  const activeCount = items.filter((item) => item.is_active).length;

  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2.5 font-medium">Fee</th>
            <th className="px-3 py-2.5 font-medium text-right">Amount</th>
            <th className="px-3 py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <FeeItemRow key={item.id} item={item} context={context} canEdit={canEdit} />
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-n-200 bg-n-50">
            <td className="px-3 py-2.5 text-sm font-medium text-ink">
              Termly total
              <span className="ml-1.5 text-xs font-normal text-n-500">
                {activeCount === 1 ? "1 fee" : `${activeCount} fees`}
              </span>
            </td>
            <td className="px-3 py-2.5 text-right font-mono text-sm font-semibold tabular-nums text-ink">
              {formatNaira(total)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
