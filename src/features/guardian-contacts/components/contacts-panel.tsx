"use client";

import { useState } from "react";
import { Plus, Upload } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

import { useGuardianContacts } from "../hooks/use-guardian-contacts";
import type { GuardianContact } from "../types";
import { AccountPhonesList } from "./account-phones-list";
import { ContactFormDialog, type ContactStudent } from "./contact-form-dialog";
import { ContactsImportDialog } from "./contacts-import-dialog";
import { ContactsList } from "./contacts-list";

type Open =
  | { kind: "add"; student?: ContactStudent }
  | { kind: "edit"; contact: GuardianContact }
  | { kind: "import" }
  | null;

// The "Parent numbers" tab on Result Cards: who each student's card PIN is
// texted to. Search is server-side (admission no., names, phone): the list
// has no per-student order, so search is how a student is found.
export function ContactsPanel() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Open>(null);
  // Bumped on each opening, so a dialog's form never carries over.
  const [opening, setOpening] = useState(0);
  const query = useDebouncedValue(search.trim(), 300);
  const { data, isPending, isError } = useGuardianContacts({ page, search: query });

  function show(next: Exclude<Open, null>) {
    setOpening((n) => n + 1);
    setOpen(next);
  }

  return (
    <div className="space-y-3">
      <p className="max-w-2xl text-sm text-n-500">
        Card PINs are texted to each student&rsquo;s main saved number. A student with none saved is texted at their
        linked parent account&rsquo;s phone, listed separately below.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          aria-label="Search parent numbers"
          placeholder="Student, adm. no., parent or phone"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-9 sm:max-w-sm"
        />
        <div className="flex gap-2 sm:ml-auto">
          <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => show({ kind: "import" })}>
            <Upload className="size-4" /> Import CSV
          </Button>
          <Button type="button" size="sm" className="h-9" onClick={() => show({ kind: "add" })}>
            <Plus className="size-4" /> Add number
          </Button>
        </div>
      </div>

      <section className="space-y-2" aria-labelledby="saved-numbers-heading">
        <h3 id="saved-numbers-heading" className="text-sm font-semibold text-ink">Saved numbers</h3>
        {isPending ? (
          <p className="text-sm text-n-400" role="status">Loading numbers…</p>
        ) : isError ? (
          <p className="text-sm text-clay">Couldn&rsquo;t load parents&rsquo; numbers. Refresh to try again.</p>
        ) : data.results.length === 0 ? (
          <p className="text-sm text-n-400 italic">
            {query ? "No saved numbers match this search." : "No numbers saved yet. Add them one by one, or import a CSV."}
          </p>
        ) : (
          <>
            <ContactsList contacts={data.results} onEdit={(contact) => show({ kind: "edit", contact })} />
            <PaginationControls page={page} pageSize={25} count={data.count} onPageChange={setPage} />
          </>
        )}
      </section>

      {/* A second, read-only list: a student without a saved number never
          appears above, so their parent-account number can only come from
          its own endpoint (one call, never ?student= per student). */}
      <AccountPhonesList
        search={query}
        onUseDifferent={(row) =>
          show({ kind: "add", student: { id: row.student_id, name: row.student_name, admission_number: row.admission_number } })
        }
      />

      <ContactFormDialog
        key={`form-${opening}`}
        open={open?.kind === "add" || open?.kind === "edit"}
        contact={open?.kind === "edit" ? open.contact : undefined}
        student={open?.kind === "add" ? open.student : undefined}
        onClose={() => setOpen(null)}
      />
      <ContactsImportDialog key={`import-${opening}`} open={open?.kind === "import"} onClose={() => setOpen(null)} />
    </div>
  );
}
