// Direct browser-to-S3 upload. Confirmed against the backend's `storage` app
// (commit 04be93e) — storage/urls.py, views.py, services.py and docs/storage.md.
//
// Mounted at /api/, NOT /api/storage/ — storage/urls.py declares the bare
// `presigned-upload/` path and config/urls.py includes it under `api/`.
// Trailing slash is required, as everywhere else.
//
// Gate is IsSchoolMember with no permission string, so any signed-in member of
// a school may request one. It is NOT public: it must carry the Bearer token,
// which is why it is deliberately absent from client.ts's PUBLIC_RULES.
//
// The upload itself does not go through this API at all — the backend never
// sees the bytes. See features/uploads/api/uploads-api.ts.
export const STORAGE_ENDPOINTS = {
  PRESIGNED_UPLOAD: "/api/presigned-upload/",
} as const;
