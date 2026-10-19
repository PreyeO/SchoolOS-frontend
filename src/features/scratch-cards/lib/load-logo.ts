export interface PdfLogo {
  dataUrl: string; // PNG
  width: number; // px, for the aspect ratio
  height: number;
}

// The school's logo, made ready for jsPDF: fetched once per download, drawn
// to a small canvas and exported as PNG, whatever the upload's format was.
//
// Optional by design. The logo is a presigned S3 link that expires, and
// reading its pixels needs the bucket to allow this origin (CORS). If any of
// that fails, or it takes more than a few seconds, this returns null and the
// slips are made without a logo rather than not at all.
export async function loadLogo(url: string | null | undefined, maxPx = 256): Promise<PdfLogo | null> {
  if (!url) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, { mode: "cors", signal: controller.signal });
    if (!response.ok) return null;
    const bitmap = await createImageBitmap(await response.blob());
    const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);
    return { dataUrl: canvas.toDataURL("image/png"), width, height };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
