"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

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
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";
import { useAddSubjects } from "@/features/onboarding/hooks/use-subject-mutations";
import type { SubjectResponse } from "@/features/onboarding/types";

interface Props {
  schoolLevels: SchoolLevelValue[];
  existingSubjects: SubjectResponse[];
}

// Mirrors onboarding's AddSubjectControl: one name can be added across several
// levels at once (e.g. "Mathematics" for Primary + JSS + SSS in a single submit),
// via the same bulk-create endpoint — just as a dialog instead of an inline control.
export function AddSubjectDialog({ schoolLevels, existingSubjects }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isCore, setIsCore] = useState(false);
  const [levels, setLevels] = useState<Set<SchoolLevelValue>>(new Set());
  const addSubjects = useAddSubjects();
  const options = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value));

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setName("");
      setIsCore(false);
      setLevels(new Set());
    }
  }

  function toggleLevel(value: SchoolLevelValue) {
    setLevels((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed || levels.size === 0) {
      toast.error("Enter a name and pick at least one level.");
      return;
    }
    const fresh = [...levels].filter(
      (level) => !existingSubjects.some((s) => s.level === level && s.name.trim().toLowerCase() === trimmed.toLowerCase()),
    );
    if (fresh.length === 0) {
      toast.error(`"${trimmed}" already exists for the selected level(s).`);
      return;
    }
    try {
      await addSubjects.mutateAsync({ subjects: fresh.map((level) => ({ name: trimmed, level, is_core: isCore })) });
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4 mr-1" /> Add subject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a subject</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="e.g. Arabic, Coding, Quranic Studies"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">Levels</p>
            <div className="flex flex-wrap gap-1.5">
              {options.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => toggleLevel(l.value)}
                  aria-pressed={levels.has(l.value)}
                  className={cn(
                    "cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors",
                    levels.has(l.value)
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-n-200 text-n-500 hover:border-n-300",
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="accent-primary"
              checked={isCore}
              onChange={(e) => setIsCore(e.target.checked)}
            />
            Core subject
          </label>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={addSubjects.isPending}>
            {addSubjects.isPending ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
