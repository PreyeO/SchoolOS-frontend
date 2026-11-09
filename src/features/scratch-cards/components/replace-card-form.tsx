"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import type { CardAssignment, IssuanceChannel, ReplaceReason } from "../types";
import { ChoiceGroup } from "./choice-group";

const REASONS: { value: ReplaceReason; label: string; hint: string }[] = [
  { value: "lost", label: "Lost", hint: "The family lost the slip or deleted the text." },
  { value: "never_arrived", label: "Never arrived", hint: "The text or slip didn't reach the family." },
  { value: "resend", label: "Send again", hint: "Any other reason to give them a fresh PIN." },
];

const CHANNELS: { value: IssuanceChannel; label: string; hint: string }[] = [
  { value: "print", label: "Print a new slip", hint: "The new PIN is shown here once, to print or copy." },
  { value: "sms", label: "Text the guardian", hint: "Sent to the guardian's number on file. Uses SMS credits from the school wallet." },
];

interface Props {
  assignment: CardAssignment;
  pending: boolean;
  onSubmit: (choice: { reason: ReplaceReason; channel: IssuanceChannel }) => void;
  onCancel: () => void;
}

export function ReplaceCardForm({ assignment, pending, onSubmit, onCancel }: Props) {
  const [reason, setReason] = useState<ReplaceReason>(assignment.channel === "sms" ? "never_arrived" : "lost");
  const [channel, setChannel] = useState<IssuanceChannel>(assignment.channel);
  const how =
    assignment.channel === "sms"
      ? `Texted to ${assignment.guardian_name || "the guardian"}${assignment.phone ? ` (${assignment.phone})` : ""}`
      : "Printed";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-n-200 bg-n-50 px-4 py-3 text-sm">
        <p className="font-medium text-ink wrap-break-word">
          {assignment.student_name} <span className="font-mono text-xs text-n-400">{assignment.admission_number}</span>
        </p>
        <p className="mt-0.5 text-xs text-n-500">
          {how} · {formatTimestamp(assignment.assigned_at)}
        </p>
      </div>

      <ChoiceGroup legend="Why replace it?" name="reason" options={REASONS} value={reason} onChange={setReason} />
      <ChoiceGroup legend="How to send the new PIN" name="channel" options={CHANNELS} value={channel} onChange={setChannel} />

      {assignment.channel === "sms" && channel === "print" && (
        <p className="text-xs text-n-500">Printing instead doesn&rsquo;t refund the credits for the earlier text.</p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" disabled={pending} onClick={() => onSubmit({ reason, channel })}>
          {pending ? "Replacing…" : channel === "sms" ? "Replace and text" : "Replace and show PIN"}
        </Button>
      </DialogFooter>
    </div>
  );
}
