import { isAxiosError } from "axios";

// DRF's HasSchoolPermission/HasPlatformPermission both return a plain 403 with
// this generic detail — no per-endpoint message, so callers must key off the
// status code rather than the (identical, unhelpful) body text.
export function isPermissionDeniedError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 403;
}

// A 400: the request reached the server and was specifically rejected as
// invalid, as opposed to a load merely failing. The distinction matters
// wherever the message itself is the point — a validation refusal like
// "Source and target session must be different." tells the user exactly what
// to change, and showing it behind a generic "couldn't load, try again" (the
// shared ErrorState's fallback for anything that isn't a 403 or unreachable
// server) throws away the one thing worth reading, then offers a retry that
// can never succeed against the same input.
export function isValidationError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 400;
}

// The request was aborted by OUR OWN timeout, not refused by the server.
//
// Distinct from isNetworkError, which this would otherwise be folded into:
// both leave `error.response` undefined, so "couldn't reach the server" is the
// message a timeout gets by default. That's fine for a read, and actively
// wrong for a long-running write — a bulk import that times out client-side
// may well have completed server-side, and telling the admin their connection
// failed invites them to retry a job that already ran.
export function isTimeoutError(error: unknown): boolean {
  return isAxiosError(error) && !error.response && error.code === "ECONNABORTED";
}

// The server was never reached — offline, DNS failure, or the 15s timeout — as
// opposed to the server answering with a rejection. The distinction matters
// wherever a failure would otherwise be read as "the backend said no": most
// sharply in the token refresh path, where treating an unreachable server as a
// rejected session would log a working user out and discard unsynced work.
export function isNetworkError(error: unknown): boolean {
  return isAxiosError(error) && !error.response;
}

// DRF serializer validation (raise_exception=True) answers with a FIELD-KEYED
// object — {"audience_personas": ["Duplicate personas in submitted list."]} —
// not the {"detail": ...} the service layer raises. Both shapes exist across
// this API: whichever fires first wins, and serializers run before services.
//
// Only the field-keyed shape was unhandled, so every such 400 fell through to
// the generic "Something went wrong", swallowing the specific, fixable message.
// Found while verifying announcements, but it is not announcements-specific —
// it applies to every endpoint whose serializer can reject input.
//
// Keys are skipped rather than shown: DRF names them by wire field
// (`audience_personas`, `body_html`), which is not what the form calls them.
// The message alone is the useful half.
function fieldErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  const messages = Object.entries(data as Record<string, unknown>)
    // non_field_errors is DRF's bucket for cross-field rules and reads as prose.
    .filter(([key]) => key !== "detail")
    .flatMap(([, value]) =>
      Array.isArray(value)
        ? value.filter((v): v is string => typeof v === "string")
        : typeof value === "string"
          ? [value]
          : [],
    );

  return messages.length > 0 ? messages.join(" ") : null;
}

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return "Network error. Please check your connection.";

    const detail = error.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) return detail.join(" ");

    // Purely additive: this only runs where `detail` was absent, which already
    // produced the generic fallback below. A specific message can replace that;
    // nothing that previously worked can regress.
    const fieldMessage = fieldErrorMessage(error.response.data);
    if (fieldMessage) return fieldMessage;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
