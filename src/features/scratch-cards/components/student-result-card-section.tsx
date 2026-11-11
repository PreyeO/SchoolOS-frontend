"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContactFormDialog, type ContactStudent } from "@/features/guardian-contacts/components/contact-form-dialog";
import { ContactsList } from "@/features/guardian-contacts/components/contacts-list";
import { useGuardianContacts } from "@/features/guardian-contacts/hooks/use-guardian-contacts";
import { formatNigerianPhone } from "@/features/guardian-contacts/lib/phone";
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
          // account_phone: the number issuance will actually text instead
          // (null when there's none). Read-only, it's the parent's account.
          contacts.data.account_phone ? (
            <p className="text-sm text-ink">
              None saved, so this student&rsquo;s card is texted to their parent&rsquo;s account phone:{" "}
              <span className="font-medium">{contacts.data.account_phone.name}</span>,{" "}
              <span className="whitespace-nowrap font-mono">{formatNigerianPhone(contacts.data.account_phone.phone)}</span>.
              <span className="block text-xs text-n-500">Add a number above to text someone else instead.</span>
            </p>
          ) : (
            <p className="text-sm text-n-500">
              None saved, and no linked parent account has a phone. Add a number to text this student&rsquo;s card.
            </p>
          )
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
