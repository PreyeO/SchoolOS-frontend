"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContactFormDialog, type ContactStudent } from "@/features/guardian-contacts/components/contact-form-dialog";
import { ContactsList } from "@/features/guardian-contacts/components/contacts-list";
import { useGuardianContacts } from "@/features/guardian-contacts/hooks/use-guardian-contacts";
import type { GuardianContact } from "@/features/guardian-contacts/types";

import { StudentCardHistory } from "./student-card-history";

// On the student detail page, for admins with manage_scratch_cards (the caller
// checks; teachers open this page too). Where this student's card PIN is
// texted, and every card they've been given.
export function StudentResultCardSection({ student }: { student: ContactStudent }) {
  const contacts = useGuardianContacts({ student: student.id });
  const [open, setOpen] = useState<{ contact?: GuardianContact } | null>(null);
  const [opening, setOpening] = useState(0);
  const show = (next: { contact?: GuardianContact }) => { setOpening((n) => n + 1); setOpen(next); };

  return (
    <div className="space-y-5 rounded-xl border border-n-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-ink">Result card</h2>

      <section className="space-y-2" aria-labelledby="student-numbers">
        <div className="flex items-center justify-between gap-3">
          <h3 id="student-numbers" className="text-xs font-medium uppercase tracking-wide text-n-400">Parent numbers</h3>
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => show({})}>
            <Plus className="size-3.5" /> Add number
          </Button>
        </div>
        {contacts.isPending ? (
          <p className="text-sm text-n-400" role="status">Loading numbers…</p>
        ) : contacts.isError ? (
          <p className="text-sm text-clay">Couldn&rsquo;t load this student&rsquo;s numbers.</p>
        ) : contacts.data.results.length === 0 ? (
          <p className="text-sm text-n-500">
            None saved. A card PIN for this student is texted to a linked parent account&rsquo;s phone, if there is one.
          </p>
        ) : (
          <ContactsList contacts={contacts.data.results} onEdit={(contact) => show({ contact })} />
        )}
      </section>

      <section className="space-y-2" aria-labelledby="student-cards">
        <h3 id="student-cards" className="text-xs font-medium uppercase tracking-wide text-n-400">Cards issued</h3>
        <StudentCardHistory studentId={student.id} />
      </section>

      <ContactFormDialog
        key={opening}
        open={!!open}
        contact={open?.contact}
        student={open?.contact ? undefined : student}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}
