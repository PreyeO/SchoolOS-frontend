"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";

import { useAccountPhones } from "../hooks/use-guardian-contacts";
import { formatNigerianPhone } from "../lib/phone";
import type { AccountPhone } from "../types";

interface Props {
  search: string;
  // Saving a contact for the student replaces this number for texts; the
  // student then leaves this list on refetch.
  onUseDifferent: (row: AccountPhone) => void;
}

// Students with no saved number whose card text goes to a linked parent
// account's phone. Read-only (it's the parent's account, not a contact), and
// hidden entirely when there are none, so the tab stays one list for most
// schools.
export function AccountPhonesList({ search, onUseDifferent }: Props) {
  const [page, setPage] = useState(1);
  // A new search starts at page 1 again.
  const [lastSearch, setLastSearch] = useState(search);
  if (search !== lastSearch) {
    setLastSearch(search);
    setPage(1);
  }
  const { data, isPending, isError } = useAccountPhones({ page, search });

  if (isPending || isError || data.results.length === 0) return null;

  return (
    <section className="space-y-2" aria-labelledby="account-phones-heading">
      <div>
        <h3 id="account-phones-heading" className="text-sm font-semibold text-ink">
          Texted at a parent account&rsquo;s phone ({data.count})
        </h3>
        <p className="text-xs text-n-500">
          These students have no number saved here, so their card is texted to the phone on their linked parent&rsquo;s
          account. It&rsquo;s the parent&rsquo;s own account, so it can&rsquo;t be edited here.
        </p>
      </div>
      <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
        {data.results.map((row) => (
          <li key={row.student_id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
            <UserRound className="size-4 shrink-0 text-n-400" aria-hidden />
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-ink wrap-break-word">{row.name}</span>
                <span className="whitespace-nowrap font-mono text-sm tabular-nums text-ink">{formatNigerianPhone(row.phone)}</span>
                <span className="whitespace-nowrap rounded-full border border-n-200 px-2 py-0.5 text-[11px] text-n-500">Parent account</span>
              </div>
              <p className="text-xs text-n-500 wrap-break-word">
                {row.student_name} · <span className="font-mono">{row.admission_number}</span>
              </p>
            </div>
            {/* Its own line on phones (indented under the text), so it doesn't
                squeeze the name and number into a narrow column. */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-5 h-8 basis-full justify-start px-2 text-xs sm:ml-0 sm:basis-auto sm:justify-center"
              onClick={() => onUseDifferent(row)}
            >
              Use a different number
            </Button>
          </li>
        ))}
      </ul>
      <PaginationControls page={page} pageSize={25} count={data.count} onPageChange={setPage} />
    </section>
  );
}
