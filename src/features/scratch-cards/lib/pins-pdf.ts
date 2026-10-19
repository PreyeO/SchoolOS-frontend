import type { jsPDF as JsPDF } from "jspdf";

import { saveBlob } from "@/lib/api/save-blob";

import type { CardPin } from "../types";
import { loadLogo, type PdfLogo } from "./load-logo";
import { SLIP_HEIGHT, SLIP_WIDTH, slipPosition } from "./slip-layout";

export interface SlipDetails {
  schoolName: string;
  sessionName: string;
  checkUrl: string;
  // Presigned and expiring; loaded per download, and skipped if it can't be.
  logoUrl?: string | null;
}

const INK: [number, number, number] = [14, 42, 36];
const MUTED: [number, number, number] = [99, 102, 96];
// The logo's box, top-right of the slip. The image keeps its proportions
// inside it, so a wide crest and a square badge both fit.
const LOGO_BOX = 12;

function fitLogo(logo: PdfLogo): { w: number; h: number } {
  const scale = LOGO_BOX / Math.max(logo.width, logo.height);
  return { w: logo.width * scale, h: logo.height * scale };
}

function drawSlip(doc: JsPDF, pin: CardPin, x: number, y: number, d: SlipDetails, logo: PdfLogo | null) {
  const pad = 5;
  doc.setLineDashPattern([1.5, 1.2], 0);
  doc.setDrawColor(140, 143, 135);
  doc.roundedRect(x, y, SLIP_WIDTH, SLIP_HEIGHT, 2, 2);
  doc.setLineDashPattern([], 0);

  if (logo) {
    const { w, h } = fitLogo(logo);
    // One alias for every slip: jsPDF embeds the image once and reuses it.
    doc.addImage(logo.dataUrl, "PNG", x + SLIP_WIDTH - pad - w, y + pad - 1, w, h, "school-logo");
  }

  const left = x + pad;
  const nameWidth = SLIP_WIDTH - pad * 2 - (logo ? LOGO_BOX + 2 : 0);
  doc.setTextColor(...INK).setFont("helvetica", "bold").setFontSize(11);
  doc.text(d.schoolName, left, y + pad + 4, { maxWidth: nameWidth });
  doc.setTextColor(...MUTED).setFont("helvetica", "normal").setFontSize(7.5);
  doc.text(`RESULT CHECK CARD  ·  ${d.sessionName}`, left, y + pad + 9);

  doc.setFontSize(7).text("SERIAL", left, y + pad + 17);
  doc.setTextColor(...INK).setFont("courier", "bold").setFontSize(13);
  doc.text(pin.serial, left, y + pad + 22.5);

  doc.setTextColor(...MUTED).setFont("helvetica", "normal").setFontSize(7);
  doc.text("PIN", left, y + pad + 29);
  doc.setTextColor(...INK).setFont("courier", "bold").setFontSize(15);
  doc.text(pin.pin.split("").join(" "), left, y + pad + 35);

  doc.setTextColor(...MUTED).setFont("helvetica", "normal").setFontSize(7);
  doc.text(
    `Check results at ${d.checkUrl}. Keep this card for every term of the session.`,
    left,
    y + SLIP_HEIGHT - pad,
    { maxWidth: SLIP_WIDTH - pad * 2 },
  );
}

// Ready-to-cut slips, ten to an A4 page. jsPDF is imported on demand: it's
// only needed at the moment someone downloads, so it stays out of every page
// bundle. Built-in fonts only (helvetica, courier), so the only thing fetched
// is the school's logo, and that's optional (see loadLogo).
export async function buildPinsPdf(pins: CardPin[], details: SlipDetails, logo: PdfLogo | null = null): Promise<JsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.setProperties({ title: `Result cards · ${details.sessionName}`, author: details.schoolName });

  pins.forEach((pin, i) => {
    const { page, x, y } = slipPosition(i);
    if (page >= doc.getNumberOfPages()) doc.addPage();
    drawSlip(doc, pin, x, y, details, logo);
  });
  return doc;
}

export async function downloadPinsPdf(pins: CardPin[], details: SlipDetails): Promise<void> {
  const doc = await buildPinsPdf(pins, details, await loadLogo(details.logoUrl));
  const safeSession = details.sessionName.replace(/[^\w-]+/g, "-");
  saveBlob(doc.output("blob"), `result-cards-${safeSession}.pdf`);
}
