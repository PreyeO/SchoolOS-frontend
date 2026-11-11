export interface PdfLogo {
  dataUrl: string; // PNG
  width: number; // px, for the aspect ratio
  height: number;
}

// Decodes any image the browser can show (PNG, JPEG, WebP and SVG) via an
// <img>. createImageBitmap can't decode SVG blobs in Chrome, which silently
// dropped an SVG logo from the PDF while the print view (a plain <img>) showed it.
function decode(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("logo decode failed")); };
    img.src = url;
  });
}

// The school's logo, made ready for jsPDF: fetched once per download, drawn
// to a small canvas and exported as PNG, whatever the upload's format was.
//
// `cache: "no-store"` is load-bearing. The app shows this same presigned URL
// as a plain <img> elsewhere (no Origin header), and S3 answers that without
// Access-Control-Allow-Origin or Vary: Origin. Chrome caches that copy and
// hands it to a later CORS fetch, which then fails, so the PDF lost its logo
// while print kept it (reported 2026-11-11). The bucket's CORS allows GET
// from school origins (checked live), so a fresh request succeeds. A
// cache-busting query param isn't an option: it would break the presigned
// signature.
//
// Optional by design: the link expires, and any failure or a 5s timeout means
// slips without a logo rather than no slips.
export const LOGO_TIMEOUT_MS = 5000;

export async function loadLogo(url: string | null | undefined, maxPx = 256): Promise<PdfLogo | null> {
  if (!url) return null;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  // The limit covers the whole job, decode included: an image that never
  // loads must not hold the download up.
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => { controller.abort(); resolve(null); }, LOGO_TIMEOUT_MS);
  });
  try {
    return await Promise.race([render(url, maxPx, controller.signal), timeout]);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function render(url: string, maxPx: number, signal: AbortSignal): Promise<PdfLogo | null> {
  const response = await fetch(url, { mode: "cors", cache: "no-store", signal });
  if (!response.ok) return null;
  const img = await decode(await response.blob());
  // An SVG with no width/height can report 0; draw it square rather than drop it.
  const naturalW = img.naturalWidth || img.width || maxPx;
  const naturalH = img.naturalHeight || img.height || maxPx;
  const scale = Math.min(1, maxPx / Math.max(naturalW, naturalH));
  const width = Math.max(1, Math.round(naturalW * scale));
  const height = Math.max(1, Math.round(naturalH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, width, height);
  return { dataUrl: canvas.toDataURL("image/png"), width, height };
}
