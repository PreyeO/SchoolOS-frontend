"use client";

import { useState } from "react";
import { Check, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SubjectResponse } from "@/features/onboarding/types";

import { useAddArmSubjects } from "../hooks/use-arm-subjects";

interface Props {
  classArmId: string;
  armLabel: string;
  // Subjects at this arm's level that it doesn't yet offer.
  available: SubjectResponse[];
}

// Declares which subjects an arm actually takes. Separate from assigning a
// teacher because the two genuinely differ: a school offers a subject before
// it has staffed it, and arms under one class diverge by track.
export function OfferSubjectsDialog({ classArmId, armLabel, available }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const add = useAddArmSubjects();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setSearch("");
      setSelected(new Set());
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const query = search.trim().toLowerCase();
  const matches = available.filter((s) => !query || s.name.toLowerCase().includes(query));

  // A new arm usually takes nearly every subject at its level, so ticking twenty
  // boxes by hand is the common case rather than the exception.
  const allMatchesSelected = matches.length > 0 && matches.every((s) => selected.has(s.id));

  function toggleAllMatches() {
    setSelected((prev) => {
      const next = new Set(prev);
      // Scoped to what's on screen. Acting on the whole list while a search is
      // active would silently add subjects the admin can't see, and clearing
      // would silently drop ones they'd already ticked.
      matches.forEach((s) => (allMatchesSelected ? next.delete(s.id) : next.add(s.id)));
      return next;
    });
  }

  async function submit() {
    if (selected.size === 0) return;
    try {
      // One request for the whole batch. The backend validates every subject
      // before writing any, so this can't half-apply.
      await add.mutateAsync({ class_arm_id: classArmId, subject_ids: [...selected] });
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" disabled={available.length === 0}>
          <Plus className="size-4 mr-1" /> Add subjects
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subjects taken by {armLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-n-500">
            Pick the subjects this class takes. You can assign teachers to them afterwards.
          </p>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-n-400" />
            <Input
              placeholder="Search subjects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              aria-label="Search subjects"
            />
          </div>

          {matches.length === 0 ? (
            <p className="py-6 text-center text-sm text-n-500">
              {query ? "No subjects match that search." : "Every subject at this level is already added."}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-n-400">
                  {selected.size > 0
                    ? `${selected.size} selected`
                    : `${matches.length} available${query ? " in this search" : ""}`}
                </span>
                <button
                  type="button"
                  onClick={toggleAllMatches}
                  className="cursor-pointer text-xs font-medium text-primary hover:underline"
                >
                  {allMatchesSelected
                    ? query
                      ? "Clear these"
                      : "Clear all"
                    : query
                      ? `Select all ${matches.length} matching`
                      : `Select all ${matches.length}`}
                </button>
              </div>

              <ul className="max-h-64 space-y-1 overflow-y-auto pr-0.5">
                {matches.map((subject) => {
                  const isSelected = selected.has(subject.id);
                  return (
                    <li key={subject.id}>
                      <button
                        type="button"
                        onClick={() => toggle(subject.id)}
                        aria-pressed={isSelected}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors",
                          isSelected ? "border-primary/40 bg-primary/5" : "border-n-200 hover:border-n-300",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate text-sm text-ink">{subject.name}</span>
                        {subject.is_core && (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            Core
                          </span>
                        )}
                        {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={selected.size === 0 || add.isPending}>
            {add.isPending
              ? "Adding…"
              : selected.size === 0
                ? "Add subjects"
                : `Add ${selected.size} subject${selected.size === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
