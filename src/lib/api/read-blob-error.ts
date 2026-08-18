import { isAxiosError } from "axios";

// Makes a failed `responseType: "blob"` request readable.
//
// axios applies the response type to error responses too, so a 400 from a PDF
// endpoint arrives as a Blob containing {"detail": "..."} rather than as parsed
// JSON. getErrorMessage looks for `data.detail`, finds a Blob, and falls
// through to "Something went wrong" — swallowing exactly the messages worth
// showing, like "No students with renderable results found for this class arm
// and period", which is a fixable empty state rather than a failure.
//
// Parses the blob back into place and returns the same error, so callers can
// keep throwing it and every existing helper (getErrorMessage,
// isPermissionDeniedError) works unchanged.
export async function readBlobError(error: unknown): Promise<unknown> {
  if (!isAxiosError(error) || !(error.response?.data instanceof Blob)) return error;

  try {
    error.response.data = JSON.parse(await error.response.data.text());
  } catch {
    // Not JSON — an HTML error page, or a body that never arrived. Clearing it
    // lets getErrorMessage fall back to its network/status wording instead of
    // reporting a Blob.
    error.response.data = undefined;
  }
  return error;
}
