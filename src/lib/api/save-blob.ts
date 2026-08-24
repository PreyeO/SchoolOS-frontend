// Hands a fetched blob to the browser as a download.
//
// Report card endpoints can't be plain <a href> links: they're bearer-token
// authenticated and an anchor carries cookies, not an Authorization header. So
// the bytes are fetched through apiClient, wrapped in a temporary object URL,
// and revoked immediately after the click — otherwise the blob is pinned in
// memory for the lifetime of the document, which for a bulk class export is
// megabytes per download.
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
