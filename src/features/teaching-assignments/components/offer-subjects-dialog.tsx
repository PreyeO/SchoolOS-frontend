"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SubjectResponse } from "@/features/onboarding/types";

import { useAddArmSubjects } from "../hooks/use-arm-subjects";
import { SubjectMultiSelect } from "./subject-multi-select";

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

  // A new arm usually takes nearly every subject at its level, so ticking twenty
  // boxes by hand is the common case rather than the exception.
  //
  // Scoped to what's on screen: acting on the whole list while a search is
  // active would silently add subjects the admin can't see, and clearing would
  // silently drop ones they'd already ticked.
  function toggleAllMatches() {
    const query = search.trim().toLowerCase();
    const matches = available.filter((s) => !query || s.name.toLowerCase().includes(query));
    const allSelected = matches.length > 0 && matches.every((s) => selected.has(s.id));
    setSelected((prev) => {
      const next = new Set(prev);
      matches.forEach((s) => (allSelected ? next.delete(s.id) : next.add(s.id)));
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

          <SubjectMultiSelect
            subjects={available}
            search={search}
            onSearchChange={setSearch}
            selected={selected}
            onToggle={toggle}
            onToggleAll={toggleAllMatches}
          />
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
