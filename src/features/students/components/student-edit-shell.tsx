"use client";

import { Pencil } from "lucide-react";

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

interface Props {
  title: string;
  // Names the student, so an admin with several tabs open can't save the wrong
  // record's medical details.
  studentName: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  children: React.ReactNode;
}

// Shared chrome for the three student-edit dialogs. Each section owns its own
// form state and fields; only the shell is common, which keeps the generics out
// of it — a single dialog generic over three different schemas was more
// machinery than three small callers.
export function StudentEditShell({
  title,
  studentName,
  open,
  onOpenChange,
  onSubmit,
  isPending,
  children,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
          <Pencil className="size-3.5 mr-1" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-sm text-n-500">{studentName}</p>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {children}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
