"use client";

import { useState } from "react";
import { Check, Search, UserRound } from "lucide-react";

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
import { useClassTeacherCandidates } from "@/features/staff/hooks/use-class-teacher-candidates";
import { teacherTypeLabel } from "@/features/staff/lib/teacher-type-label";
import type { ClassArmRecord } from "@/lib/school/class-record";

import { useAssignClassTeacher, useUnassignClassTeacher } from "../../hooks/use-class-teacher-mutations";

interface Props {
  arm: ClassArmRecord;
  trigger: React.ReactNode;
  // Display name for this arm in the dialog title. See ClassTeacherControl —
  // a class with only the system placeholder arm passes its class name.
  label?: string;
}

export function AssignClassTeacherDialog({ arm, trigger, label }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const assign = useAssignClassTeacher();
  const unassign = useUnassignClassTeacher();

  // Only fetch once the dialog is actually opened — this sits on every arm row,
  // and a class list can hold dozens of them.
  const { data: teachers, isPending, isError } = useClassTeacherCandidates(open);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setSearch("");
      setSelected(arm.class_teacher?.id ?? null);
    }
  }

  const query = search.trim().toLowerCase();
  const matches = (teachers ?? []).filter(
    (t) =>
      !query ||
      `${t.user.first_name} ${t.user.last_name}`.toLowerCase().includes(query) ||
      t.user.email.toLowerCase().includes(query),
  );

  async function submit() {
    if (!selected) return;
    try {
      await assign.mutateAsync({ armId: arm.id, teacherProfileId: selected });
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  // Removal lives here rather than as its own row control: it's the same
  // decision as assigning, just the empty case, and keeping it here means the
  // arm row needs one teacher affordance instead of three.
  async function remove() {
    try {
      await unassign.mutateAsync(arm.id);
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  const pending = assign.isPending || unassign.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Form teacher for {label ?? arm.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-n-400" />
            <Input
              placeholder="Search teachers by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              aria-label="Search teachers"
            />
          </div>

          {isPending ? (
            <p className="py-6 text-center text-sm text-n-400" role="status">Loading teachers…</p>
          ) : isError ? (
            <p className="py-6 text-center text-sm text-clay">Couldn&rsquo;t load teachers. Try again.</p>
          ) : matches.length === 0 ? (
            <div className="space-y-1 py-6 text-center">
              <p className="text-sm text-n-500">
                {query ? "No teachers match that search." : "No teachers to choose from yet."}
              </p>
              {!query && (
                <p className="text-xs text-n-400">
                  Only a teacher whose type is &ldquo;{teacherTypeLabel("class")}&rdquo; or
                  &ldquo;{teacherTypeLabel("both")}&rdquo; can run a class. Invite one, or
                  change an existing teacher&rsquo;s type.
                </p>
              )}
            </div>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto pr-0.5">
              {matches.map((teacher) => {
                const isSelected = selected === teacher.id;
                const leads = teacher.class_arms.filter((a) => a.id !== arm.id);
                return (
                  <li key={teacher.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(teacher.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors",
                        isSelected
                          ? "border-primary/40 bg-primary/5"
                          : "border-n-200 hover:border-n-300",
                      )}
                    >
                      <UserRound className="size-4 shrink-0 text-n-400" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">
                          {teacher.user.first_name} {teacher.user.last_name}
                        </span>
                        <span className="block truncate text-xs text-n-400">
                          {leads.length > 0
                            ? `Already form teacher of ${leads.map((a) => a.name).join(", ")}`
                            : teacher.user.email}
                        </span>
                      </span>
                      {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {arm.class_teacher && (
          <p className="text-xs text-n-400">
            Removing the form teacher leaves {label ?? arm.name} without one — nobody can
            mark its attendance until another is assigned.
          </p>
        )}

        <DialogFooter className="sm:justify-between">
          {arm.class_teacher ? (
            <Button
              type="button"
              variant="ghost"
              onClick={remove}
              disabled={pending}
              className="text-clay hover:bg-clay/10 hover:text-clay"
            >
              {unassign.isPending ? "Removing…" : "Remove form teacher"}
            </Button>
          ) : (
            <span />
          )}
          <span className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={submit}
              disabled={!selected || selected === arm.class_teacher?.id || pending}
            >
              {assign.isPending ? "Saving…" : arm.class_teacher ? "Change" : "Assign"}
            </Button>
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
