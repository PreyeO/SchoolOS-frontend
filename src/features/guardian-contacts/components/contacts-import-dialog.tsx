"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useCommitContactImport, usePreviewContactImport } from "../hooks/use-guardian-contacts";
import type { ContactImportResult } from "../types";
import { ImportFileStep } from "./import-file-step";
import { ImportRows } from "./import-rows";

interface Props {
  open: boolean;
  onClose: () => void;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Check (preview, writes nothing) → Import (the same file again, to commit) →
// done. The server keeps nothing between the two calls, so commit re-uploads.
// Mount with a key per opening so each one starts at the file step.
export function ContactsImportDialog({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ContactImportResult | null>(null);
  const [done, setDone] = useState<ContactImportResult | null>(null);
  const check = usePreviewContactImport();
  const commit = useCommitContactImport();

  let description: string;
  let body: React.ReactNode;
  if (done) {
    description = `${plural(done.applied.length, "number")} imported${done.skipped.length ? `, ${done.skipped.length} skipped` : ""}.`;
    body = (
      <>
        <ImportRows result={done} />
        <DialogFooter><Button type="button" onClick={onClose}>Done</Button></DialogFooter>
      </>
    );
  } else if (preview && file) {
    description = preview.applied.length
      ? `${plural(preview.applied.length, "number")} ready to import${preview.skipped.length ? `; ${preview.skipped.length} rows will be skipped` : ""}. Nothing is saved until you import.`
      : "No row in this file can be imported. Fix the rows below and choose the file again.";
    body = (
      <>
        <ImportRows result={preview} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setPreview(null); setFile(null); }}>
            Choose another file
          </Button>
          <Button
            type="button"
            disabled={preview.applied.length === 0 || commit.isPending}
            onClick={() => commit.mutate(file, { onSuccess: setDone })}
          >
            {commit.isPending ? "Importing…" : `Import ${plural(preview.applied.length, "number")}`}
          </Button>
        </DialogFooter>
      </>
    );
  } else {
    description = "Add many parents' numbers at once from a spreadsheet saved as CSV.";
    body = (
      <ImportFileStep
        isPending={check.isPending}
        onPreview={(chosen) => check.mutate(chosen, { onSuccess: (result) => { setFile(chosen); setPreview(result); } })}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import parents&rsquo; numbers</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}
