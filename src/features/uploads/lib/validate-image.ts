// Client-side guard mirroring the S3 POST policy the backend signs
// (storage/services.py generate_upload_post + settings S3_MAX_UPLOAD_SIZE_BYTES).
//
// This is convenience, not security: S3 enforces the same conditions server-side
// and rejects a violating upload whatever the browser sends. The point is that a
// 6MB file should be refused in the field with a sentence someone can act on,
// rather than after a round trip to Amazon that fails as an opaque CORS-shaped
// error — a rejected POST looks identical to a network failure from JS.

// 5 * 1024 * 1024, matching S3_MAX_UPLOAD_SIZE_BYTES exactly. The policy's
// content-length-range also sets a floor of 1 byte, so an empty file is
// rejected too — worth catching here because a 0-byte file is usually a
// half-finished copy rather than a deliberate choice.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// The backend's policy pins Content-Type to whatever we request, so any type
// would technically pass. Restricted to raster images because every consumer is
// an <img> — a logo or a portrait. SVG is deliberately excluded: it can carry
// script, and these render on other people's screens.
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const TYPE_LABEL = "PNG, JPG, WebP or GIF";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Returns an error message, or null when the file is acceptable.
export function validateImage(file: File): string | null {
  // An empty type means the browser couldn't identify the file. The presigned
  // policy pins Content-Type to what we send, so an empty one cannot match and
  // S3 would reject the POST — catch it here where we can say why.
  if (!file.type) {
    return `That file type wasn't recognised. Use ${TYPE_LABEL}.`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `That file is a ${file.type.replace("image/", "").toUpperCase()}. Use ${TYPE_LABEL}.`;
  }
  if (file.size === 0) {
    return "That file is empty.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That image is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`;
  }
  return null;
}

export const ACCEPT_ATTRIBUTE = ALLOWED_TYPES.join(",");
