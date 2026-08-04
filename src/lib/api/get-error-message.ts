import { isAxiosError } from "axios";

// DRF's HasSchoolPermission/HasPlatformPermission both return a plain 403 with
// this generic detail — no per-endpoint message, so callers must key off the
// status code rather than the (identical, unhelpful) body text.
export function isPermissionDeniedError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 403;
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
