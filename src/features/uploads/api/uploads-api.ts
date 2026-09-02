import { apiClient } from "@/lib/api/client";
import { STORAGE_ENDPOINTS } from "@/lib/api/endpoints";

import type { PresignedUpload, PresignedUploadRequest } from "../types";

// Step 1 — ask the backend to sign an upload. Goes through apiClient because it
// needs the Bearer token: the gate is IsSchoolMember, and the backend derives
// owner_id from the caller's own school. Never send an owner id.
export async function requestPresignedUpload(
  payload: PresignedUploadRequest,
): Promise<PresignedUpload> {
  const { data } = await apiClient.post<PresignedUpload>(
    STORAGE_ENDPOINTS.PRESIGNED_UPLOAD,
    payload,
  );
  return data;
}

// Step 2 — the file itself, straight to S3. The backend never sees these bytes.
//
// Bare fetch, NOT apiClient, and that is load-bearing: apiClient's request
// interceptor attaches `Authorization: Bearer <access>` to everything that
// isn't on the public list, and this URL isn't ours — it would ship a SchoolOS
// JWT to Amazon on every logo upload. docs/storage.md says not to; using a
// different HTTP client is what actually guarantees it.
//
// Field order matters. S3 requires the file LAST, after every policy field, and
// rejects the POST outright otherwise. Every entry in `fields` is forwarded, not
// a chosen subset — the signature covers all of them.
export async function uploadToS3(
  presigned: PresignedUpload,
  file: File,
  signal?: AbortSignal,
): Promise<void> {
  const form = new FormData();
  for (const [name, value] of Object.entries(presigned.fields)) {
    form.append(name, value);
  }
  form.append("file", file);

  // No Content-Type header is set by hand: the browser must generate it so it
  // carries the multipart boundary. The policy's own Content-Type condition is
  // satisfied by the `Content-Type` FORM FIELD in `fields`, which is a
  // different thing from the request header — setting the header here would
  // break the boundary and the upload with it.
  const response = await fetch(presigned.url, { method: "POST", body: form, signal });

  // S3 answers 204 on success. Anything else — an expired policy, a
  // content-type mismatch, a size violation — means nothing landed, and the key
  // must not be attached. A bucket CORS failure surfaces as a thrown TypeError
  // from fetch rather than a response at all, which the caller also treats as
  // failure.
  if (!response.ok) {
    throw new Error(`S3 rejected the upload (${response.status}).`);
  }
}
