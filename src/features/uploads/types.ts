// Direct browser-to-S3 upload, in three steps the backend documents in
// docs/storage.md and enforces in storage/services.py:
//
//   1. POST /api/presigned-upload/  → { key, url, fields }
//   2. POST `url` (FormData) to S3  → 204
//   3. PATCH the resource with `key`  → backend HEADs S3, then saves
//
// Step 1 issues a RESERVATION, not an asset. A key whose S3 POST failed or was
// abandoned must never reach step 3 — the backend's HEAD would reject it with a
// 400 anyway, but the correct handling is to simply never send it.

// The whitelisted prefixes, from storage/services.py ALLOWED_PREFIXES. The
// backend derives owner_id from the caller's school itself, so these are the
// only part of the key a client chooses.
//
// `user-photos` was held back until User.photo_key had a write path, so no
// upload could be orphaned. It has one since 2026-10-13: PATCH /teachers/:id/
// accepts photo_key. That's still the ONLY writer — admins and parents have no
// photo route — so request this prefix only on the way to that PATCH.
export type UploadPrefix = "school-logos" | "student-photos" | "user-photos";

export interface PresignedUploadRequest {
  prefix: UploadPrefix;
  filename: string;
  content_type: string;
}

export interface PresignedUpload {
  // The S3 object key. This is what goes to the resource PATCH as logo_key /
  // photo_key — never the URL, and never a key the client invented.
  key: string;
  // The S3 bucket URL to POST the form to. Expires in 5 minutes.
  url: string;
  // Every entry must be forwarded as a form field, not a chosen subset — the
  // policy signature covers all of them, and the exact set varies with the
  // signing method (x-amz-* entries may or may not be present).
  fields: Record<string, string>;
}
