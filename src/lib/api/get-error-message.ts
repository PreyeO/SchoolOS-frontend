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

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return "Network error. Please check your connection.";

    const detail = error.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) return detail.join(" ");
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
