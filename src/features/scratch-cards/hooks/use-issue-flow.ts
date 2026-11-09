"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage, isConflictError } from "@/lib/api/get-error-message";
import { newIdempotencyKey } from "@/lib/api/idempotency-key";

import { issuanceFingerprint } from "../lib/issuance-target";
import { toCardPin } from "../lib/issuance-verdict";
import type { IssuancePreview, IssuancePreviewPayload } from "../types";
import type { IssueOutcome } from "../components/issue/issue-result";
import { useCommitIssuance, usePreviewIssuance } from "./use-issuance";

// Preview → commit, with the idempotency rules from the handoff:
// - one key per issuance (session + channel + scope), kept across re-checks
//   and commit retries, so a lost response can't issue twice;
// - a new key the moment the request changes, since the server refuses a key
//   reused for a different issuance.
export function useIssueFlow() {
  const previewMutation = usePreviewIssuance();
  const commitMutation = useCommitIssuance();
  const [checked, setChecked] = useState<{ payload: IssuancePreviewPayload; preview: IssuancePreview } | null>(null);
  const [outcome, setOutcome] = useState<IssueOutcome | null>(null);
  const key = useRef<{ fingerprint: string; value: string } | null>(null);

  function keyFor(payload: IssuancePreviewPayload): string {
    const fingerprint = issuanceFingerprint(payload);
    if (key.current?.fingerprint !== fingerprint) key.current = { fingerprint, value: newIdempotencyKey() };
    return key.current.value;
  }

  function check(payload: IssuancePreviewPayload) {
    keyFor(payload);
    previewMutation.mutate(payload, { onSuccess: (preview) => setChecked({ payload, preview }) });
  }

  function commit(sessionName: string) {
    if (!checked) return;
    const { payload } = checked;
    commitMutation.mutate(
      { ...payload, idempotency_key: keyFor(payload) },
      {
        onSuccess: ({ batch, pins }) => {
          // Done with this issuance: the next one, even if identical, is new.
          key.current = null;
          setOutcome(pins ? { kind: "pins", pins: pins.map(toCardPin), sessionName } : { kind: "texted", batch });
        },
        onError: (error) =>
          isConflictError(error) ? setOutcome({ kind: "already-done" }) : toast.error(getErrorMessage(error)),
      },
    );
  }

  function reset() {
    setChecked(null);
    setOutcome(null);
    key.current = null;
  }

  return {
    checked,
    // Editing the form makes a preview stale; the caller drops it.
    clearCheck: () => setChecked(null),
    check,
    commit,
    reset,
    outcome,
    isChecking: previewMutation.isPending,
    isCommitting: commitMutation.isPending,
  };
}
