import { isAxiosError } from "axios";

// DRF's HasSchoolPermission/HasPlatformPermission both return a plain 403 with
// this generic detail — no per-endpoint message, so callers must key off the
// status code rather than the (identical, unhelpful) body text.
export function isPermissionDeniedError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 403;
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
