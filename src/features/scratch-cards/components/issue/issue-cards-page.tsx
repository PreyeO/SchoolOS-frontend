"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ContactFormDialog } from "@/features/guardian-contacts/components/contact-form-dialog";
import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useSchoolStore } from "@/stores/school-store";

import { useIssueFlow } from "../../hooks/use-issue-flow";
import { toPreviewPayload } from "../../lib/issuance-target";
import { issuanceVerdict } from "../../lib/issuance-verdict";
import type { PreviewRow } from "../../types";
import { IssueForm, type IssueFormState } from "./issue-form";
import { IssueResult } from "./issue-result";
import { PreviewBuckets } from "./preview-buckets";
import { PreviewSummary } from "./preview-summary";

// /scratch-cards/issue: give purchased cards to named students, by text or as
// printed slips. Check (preview, writes nothing) → Issue (commit) → result.
export function IssueCardsPage() {
  const { data: sessions = [], isPending: sessionsPending } = useAcademicSessions();
  const { data: classes = [] } = useClasses();
  const currentSessionName = useSchoolStore((s) => s.currentSchool?.sessionName);
  const flow = useIssueFlow();
  const [form, setForm] = useState<IssueFormState | null>(null);
  const [adding, setAdding] = useState<PreviewRow | null>(null);

  const defaultSession = sessions.find((s) => s.name === currentSessionName) ?? sessions[0];
  const state: IssueFormState = form ?? {
    sessionId: defaultSession?.id ?? "", channel: "sms", scope: "class", classId: "", armId: "", students: [],
  };
  const payload = toPreviewPayload({ ...state, studentIds: state.students.map((s) => s.id) });
  const sessionName = sessions.find((s) => s.id === state.sessionId)?.name ?? "";
  const checked = flow.checked;
  const verdict = checked ? issuanceVerdict(checked.preview, checked.payload, checked.payload.channel) : null;

  const header = (
    <div>
      <Link href="/scratch-cards" className="text-sm text-primary hover:underline">← Result Cards</Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">Issue cards</h1>
      <p className="mt-1 max-w-2xl text-sm text-n-500">
        Give cards from stock to named students. Each card is tied to its student, so a lost one can be replaced.
      </p>
    </div>
  );

  if (flow.outcome) {
    return (
      <div className="space-y-6">
        {header}
        <IssueResult outcome={flow.outcome} onAnother={() => { flow.reset(); setForm(null); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}
      <section className="rounded-xl border border-n-200 bg-white p-5">
        {sessionsPending ? (
          <p className="text-sm text-n-400" role="status">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-n-500">Cards belong to an academic session, and this school has none yet.</p>
        ) : (
          <div className="space-y-5">
            <IssueForm
              value={state}
              sessions={sessions}
              classes={classes}
              onChange={(next) => { setForm(next); flow.clearCheck(); }}
            />
            <Button type="button" disabled={!payload || flow.isChecking} onClick={() => payload && flow.check(payload)}>
              {flow.isChecking ? "Checking…" : checked ? "Check again" : "Check who gets a card"}
            </Button>
          </div>
        )}
      </section>

      {checked && verdict && (
        <section className="space-y-4 rounded-xl border border-n-200 bg-white p-5" aria-label="Preview">
          <PreviewSummary preview={checked.preview} channel={checked.payload.channel} verdict={verdict} />
          <PreviewBuckets preview={checked.preview} channel={checked.payload.channel} onAddNumber={setAdding} />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" disabled={!verdict.canCommit || flow.isCommitting} onClick={() => flow.commit(sessionName)}>
              {flow.isCommitting
                ? "Issuing…"
                : checked.preview.eligible.length === 0
                  ? "Nothing to send"
                  : checked.payload.channel === "sms"
                  ? `Text ${checked.preview.eligible.length} parents (${checked.preview.credits_required} credits)`
                  : `Issue ${checked.preview.eligible.length} cards and show PINs`}
            </Button>
            <p className="text-xs text-n-400">Nothing is issued until you press this.</p>
          </div>
        </section>
      )}

      <ContactFormDialog
        key={adding?.student_id ?? "closed"}
        open={!!adding}
        student={adding ? { id: adding.student_id, name: adding.student_name, admission_number: adding.admission_number } : undefined}
        onClose={() => setAdding(null)}
        // The preview is a snapshot: check again so this student moves over.
        onSaved={() => checked && flow.check(checked.payload)}
      />
    </div>
  );
}
