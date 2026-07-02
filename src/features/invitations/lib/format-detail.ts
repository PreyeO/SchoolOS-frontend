// Success responses use the same { detail: string | string[] } shape as errors
// (which go through lib/api/get-error-message.ts). This mirrors that join
// behavior for the success/toast path.
export function formatDetail(detail: string | string[]): string {
  return Array.isArray(detail) ? detail.join(" ") : detail;
}
