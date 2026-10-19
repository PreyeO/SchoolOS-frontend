import type { CardPin } from "../types";
import type { SlipDetails } from "./pins-pdf";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Printable slips, one per card, in a window of their own. Printing the
// dashboard page instead would bring the sidebar and topbar along, and a slip
// is what actually gets cut out and handed to a parent.
//
// Must be called from a click handler: browsers only allow window.open from a
// user action. Returns false when the popup was blocked, so the caller can
// point at the CSV instead.
export function printPinSlips(
  pins: CardPin[],
  { schoolName, sessionName, checkUrl, logoUrl }: SlipDetails,
): boolean {
  const win = window.open("", "_blank", "width=820,height=900");
  if (!win) return false;

  // A plain <img> needs no CORS, unlike the PDF's copy. If the presigned link
  // has expired it removes itself rather than printing a broken-image box.
  const logo = logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="" onerror="this.remove()">` : "";

  const slips = pins
    .map(
      (p) => `<div class="slip">
  ${logo}
  <div class="school">${escapeHtml(schoolName)}</div>
  <div class="label">Result check card · ${escapeHtml(sessionName)}</div>
  <div class="row"><span>Serial</span><b>${escapeHtml(p.serial)}</b></div>
  <div class="row"><span>PIN</span><b>${escapeHtml(p.pin)}</b></div>
  <div class="foot">Check results at ${escapeHtml(checkUrl)}. Keep this card for every term of the session.</div>
</div>`,
    )
    .join("");

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Result PINs</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 16px; color: #0E2A24; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .slip { position: relative; border: 1px dashed #8C8F87; border-radius: 8px; padding: 12px 14px; break-inside: avoid; }
  .logo { position: absolute; top: 10px; right: 12px; max-width: 44px; max-height: 44px; object-fit: contain; }
  .school { font-weight: 700; font-size: 14px; padding-right: 52px; }
  .label { font-size: 11px; color: #636660; margin-bottom: 8px; }
  .row { display: flex; justify-content: space-between; font-size: 13px; padding: 2px 0; }
  .row b { font-family: ui-monospace, Consolas, monospace; letter-spacing: 0.05em; }
  .foot { font-size: 10px; color: #636660; margin-top: 8px; }
</style></head><body><div class="grid">${slips}</div></body></html>`);
  win.document.close();
  win.focus();

  // Wait for the logo (at most 3s) so the first print isn't missing it. A
  // logo that fails removes itself and counts as done.
  const pending = Array.from(win.document.images)
    .filter((img) => !img.complete)
    .map((img) => new Promise<void>((resolve) => {
      img.addEventListener("load", () => resolve(), { once: true });
      img.addEventListener("error", () => resolve(), { once: true });
    }));
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 3000));
  void Promise.race([Promise.all(pending), timeout]).then(() => win.print());
  return true;
}
