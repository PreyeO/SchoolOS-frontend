"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

// Matches optionalLongText in schemas/student-edit-schema.ts (allergies,
// hobbies, chronic conditions) — the established cap for a free-text field on
// a student record elsewhere in this app, applied here for the same reason:
// a running handover note is read between lessons and should stay scannable,
// not become an essay.
export const MAX_NOTE_LENGTH = 1000;

interface Props {
  placeholder: string;
  initialValue?: string;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (note: string) => void;
  onCancel?: () => void;
}

// Shared by "add to this student's note" and "edit my own entry in it" — the
// field, its validation and its buttons are identical, only the labels differ.
//
// A plain textarea rather than the TipTap editor used for announcements: a note
// is a paragraph a teacher types between lessons, and the backend stores it as
// unformatted text. Rich text here would imply formatting that nothing renders.
export function NoteComposer({
  placeholder,
  initialValue = "",
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: Props) {
  const [value, setValue] = useState(initialValue);
  // The backend rejects blank ("This field may not be blank"), and whitespace
  // trims to blank — so the button is disabled rather than letting an obvious
  // mistake round-trip.
  const trimmed = value.trim();
  const unchanged = trimmed === initialValue.trim();
  const overLimit = trimmed.length > MAX_NOTE_LENGTH;

  return (
    <div className="space-y-1.5">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={MAX_NOTE_LENGTH}
        aria-label={submitLabel}
        className="w-full resize-y rounded-lg border border-n-200 bg-white px-3 py-2 text-base placeholder:text-n-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 md:text-sm"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={!trimmed || unchanged || overLimit || isPending}
            onClick={() => onSubmit(trimmed)}
          >
            {isPending ? "Saving…" : submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        {/* maxLength on the textarea already stops typing past the cap, so this
            is a heads-up as someone approaches it, not a validation message. */}
        <span className={`text-xs ${overLimit ? "text-clay" : "text-n-400"}`}>
          {trimmed.length}/{MAX_NOTE_LENGTH}
        </span>
      </div>
    </div>
  );
}
