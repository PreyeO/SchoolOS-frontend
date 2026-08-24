"use client";

import { Receipt } from "lucide-react";

interface Props {
  context: string;
  canEdit: boolean;
  // True when every fee on this class/term has been retired, so the list is
  // empty only because the toggle is off — a different situation from a class
  // that was never given fees, and one the user can fix from here.
  hasHidden: boolean;
}

// Nothing billed for this class this term. Says which class and term, because
// the pickers default to the current term and the first class — so an empty
// table often means "look somewhere else", not "add something here".
export function FeeItemsEmpty({ context, canEdit, hasHidden }: Props) {
  return (
    <div className="rounded-xl border border-n-200 bg-white px-6 py-12 text-center">
      <Receipt className="mx-auto size-6 text-n-300" />
      <p className="mt-3 text-sm font-medium text-ink">No fees set for {context}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-n-500">
        {hasHidden
          ? "Every fee for this class and term has been retired. Turn on “Show retired fees” above to see them."
          : canEdit
            ? "Add each line this class is charged — tuition, books, uniform. Students are billed the total automatically."
            : "Nobody in this class is billed anything for this term yet."}
      </p>
    </div>
  );
}
