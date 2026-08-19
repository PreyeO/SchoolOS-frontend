"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/text/format-timestamp";

interface Props {
  label: string;
  // What this remark is and where it ends up. Worth stating: both remarks are
  // their own top-level report card sections (ReportCardSection.
  // CLASS_TEACHER_REMARK / PRINCIPAL_REMARK), independently togglable from the
  // behaviour ratings — so neither is a comment on conduct, even though the
  // form teacher writes theirs on the same screen as the trait scales.
  hint?: string;
  placeholder: string;
  saved: string | null | undefined;
  savedByName: string | null;
  savedAt: string | null | undefined;
  isPending: boolean;
  onSave: (remark: string) => void;
  // Shown read-only when the writer isn't this user — a form teacher sees the
  // principal's remark, and vice versa, without being able to edit it.
  readOnly?: boolean;
}

// Saved per student rather than as part of a bulk submit.
//
// Remarks are the one part of a report card with no marked_at and no conflict
// rule — the server stamps the author and time on write — so there is no queue
// to batch into and no last-write-wins to fall back on. Saving each as it's
// written is the honest shape: it can't be replayed, so it shouldn't look like
// something that could be.
export function RemarkField({
  label,
  hint,
  placeholder,
  saved,
  savedByName,
  savedAt,
  isPending,
  onSave,
  readOnly,
}: Props) {
  const [value, setValue] = useState<string | null>(null);
  // null means untouched, so the saved copy shows through; "" is a real edit.
  const current = value ?? saved ?? "";
  const dirty = value !== null && value.trim() !== (saved ?? "").trim();

  if (readOnly) {
    return (
      <div className="rounded-lg border border-n-200 bg-n-50 px-3 py-2.5">
        <p className="text-xs font-medium text-n-500">{label}</p>
        {saved ? (
          <>
            <p className="mt-1 text-sm text-ink">{saved}</p>
            {savedByName && savedAt && (
              <p className="mt-1 text-[11px] text-n-400">
                {savedByName} · {formatTimestamp(savedAt)}
              </p>
            )}
          </>
        ) : (
          <p className="mt-1 text-sm text-n-400 italic">Not written yet.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="block">
        <span className="block text-xs font-medium text-n-500">{label}</span>
        {hint && <span className="mb-1 block text-[11px] text-n-400">{hint}</span>}
        {/* text-base below md: under 16px iOS zooms the page on focus, and a
            teacher writing forty of these on a phone would fight it every time. */}
        <textarea
          value={current}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
        />
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        {dirty ? (
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs"
            disabled={isPending || !current.trim()}
            onClick={() => {
              onSave(current.trim());
              setValue(null);
            }}
          >
            {isPending ? "Saving…" : "Save remark"}
          </Button>
        ) : saved ? (
          <span className="flex items-center gap-1 text-[11px] text-n-400">
            <Check className="size-3 text-grass" />
            Saved{savedAt ? ` · ${formatTimestamp(savedAt)}` : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
}
