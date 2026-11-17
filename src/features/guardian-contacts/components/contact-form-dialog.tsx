"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PersonSearchSelect } from "@/components/shared/person-search-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStudents } from "@/features/students/api/students-api";
import { TextField } from "@/features/students/components/student-field";

import { useCreateContact, useUpdateContact } from "../hooks/use-guardian-contacts";
import { formatNigerianPhone, toE164 } from "../lib/phone";
import { contactSchema, type ContactValues } from "../schemas/contact-schema";
import type { GuardianContact } from "../types";

export interface ContactStudent {
  id: string;
  name: string;
  admission_number: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  // Edit when set. The student can't change: the server refuses to move a number.
  contact?: GuardianContact;
  // Add for this student, skipping the picker (issuance's inline "add number").
  student?: ContactStudent;
  onSaved?: (contact: GuardianContact) => void;
}

// Mount with a key per opening so the form starts clean each time.
export function ContactFormDialog({ open, onClose, contact, student: given, onSaved }: Props) {
  const [picked, setPicked] = useState<ContactStudent | null>(null);
  const student = contact
    ? { id: contact.student, name: contact.student_name, admission_number: contact.admission_number }
    : (given ?? picked);
  const create = useCreateContact();
  const update = useUpdateContact();
  const pending = create.isPending || update.isPending;

  const { register, handleSubmit, formState: { errors } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact
      ? { name: contact.name, phone: formatNigerianPhone(contact.phone), is_primary: contact.is_primary }
      : { name: "", phone: "", is_primary: true },
  });
  // The server refuses to un-primary the only primary; say so up front.
  const lockedPrimary = !!contact?.is_primary;

  function submit(values: ContactValues) {
    const done = { onSuccess: (saved: GuardianContact) => { onSaved?.(saved); onClose(); } };
    const phone = toE164(values.phone);
    if (contact) {
      // Only what changed, so an untouched primary flag isn't re-sent.
      update.mutate(
        {
          id: contact.id,
          ...(values.name.trim() !== contact.name && { name: values.name.trim() }),
          ...(phone !== contact.phone && { phone }),
          ...(values.is_primary !== contact.is_primary && { is_primary: values.is_primary }),
        },
        done,
      );
    } else if (student) {
      create.mutate({ student_id: student.id, name: values.name.trim(), phone, is_primary: values.is_primary }, done);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit number" : "Add a parent's number"}</DialogTitle>
          <DialogDescription>
            {student ? `For ${student.name} (${student.admission_number}).` : "Choose the student first."}
          </DialogDescription>
        </DialogHeader>

        {!student ? (
          <PersonSearchSelect
            queryKey="students"
            search={(q) => getStudents({ search: q, page_size: 10 }).then((r) => r.results)}
            getId={(s) => s.id}
            getLabel={(s) => `${s.user.first_name} ${s.user.last_name}`}
            getSubLabel={(s) => `Admission no. ${s.admission_number}`}
            onSelect={(s) =>
              setPicked({ id: s.id, name: `${s.user.first_name} ${s.user.last_name}`, admission_number: s.admission_number })
            }
            placeholder="Student name or admission no."
          />
        ) : (
          <form noValidate className="space-y-4" onSubmit={handleSubmit(submit)}>
            <TextField id="contact-name" label="Parent or guardian's name" error={errors.name} registration={register("name")} />
            <TextField
              id="contact-phone"
              label="Mobile number"
              type="tel"
              hint="0803 123 4567, or with +234."
              error={errors.phone}
              registration={register("phone")}
            />
            {/* Not a disabled checkbox: react-hook-form reads a disabled
                input as undefined, which would fail the boolean. */}
            {lockedPrimary ? (
              <p className="text-xs text-n-500">
                This is the main number for result card texts. To change that, make another of this student&rsquo;s
                numbers the main one.
              </p>
            ) : (
              <label className="flex items-start gap-2.5 text-sm text-ink">
                <input type="checkbox" className="mt-0.5 size-4 accent-primary" {...register("is_primary")} />
                <span>
                  Main number for result card texts
                  <span className="block text-xs text-n-500">
                    Each student has one. A student&rsquo;s first number is always the main one.
                  </span>
                </span>
              </label>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save number"}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
