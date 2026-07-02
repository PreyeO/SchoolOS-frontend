"use client";

import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SchoolSummary } from "../types";

interface SchoolSelectorProps {
  schools: SchoolSummary[];
  pending: boolean;
  pendingSlug: string | null;
  onPick: (slug: string) => void;
  onBack: () => void;
}

export function SchoolSelector({
  schools,
  pending,
  pendingSlug,
  onPick,
  onBack,
}: SchoolSelectorProps) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-sm text-n-500 hover:text-ink transition-colors disabled:opacity-50"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <div className="space-y-2">
        {schools.map((school) => {
          const loading = pending && pendingSlug === school.slug;
          return (
            <button
              key={school.slug}
              type="button"
              onClick={() => onPick(school.slug)}
              disabled={pending}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border border-n-200 px-4 py-3 text-left transition-colors",
                "hover:border-brand/40 hover:bg-n-50 disabled:opacity-60",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink truncate">{school.name}</p>
                <p className="text-xs text-n-400 truncate">{school.subdomain}</p>
              </div>
              {loading ? (
                <Loader2 className="size-4 shrink-0 animate-spin text-brand" />
              ) : (
                <ChevronRight className="size-4 shrink-0 text-n-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
