import { ScrollText, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  // "No activity at all" and "nothing matched your filters" are different
  // situations and shouldn't share one message — the second is a dead end
  // unless it offers a way back out.
  isFiltered: boolean;
  onClearFilters: () => void;
}

export function AuditLogEmpty({ isFiltered, onClearFilters }: Props) {
  const Icon = isFiltered ? SearchX : ScrollText;

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-n-200 bg-white py-12 text-center">
      <Icon className="size-6 text-n-300" />
      <p className="text-sm font-medium text-ink">
        {isFiltered ? "No activity matches these filters" : "No recorded activity yet"}
      </p>
      <p className="max-w-sm text-sm text-n-500">
        {isFiltered
          ? "Try a wider time period, a different activity type, or clear the search."
          : "Changes your team makes — invites, role changes, class and grading edits — will appear here as they happen."}
      </p>
      {isFiltered && (
        <Button type="button" variant="outline" size="sm" className="mt-1" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
