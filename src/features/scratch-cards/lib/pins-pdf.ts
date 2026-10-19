import type { jsPDF as JsPDF } from "jspdf";

import { saveBlob } from "@/lib/api/save-blob";

import type { CardPin } from "../types";
import { SLIP_HEIGHT, SLIP_WIDTH, slipPosition } from "./slip-layout";

export interface SlipDetails {
  schoolName: string;
  sessionName: string;
  checkUrl: string;
}

const INK: [number, number, number] = [14, 42, 36];
const MUTED: [number, number, number] = [99, 102, 96];

function drawSlip(doc: JsPDF, pin: CardPin, x: number, y: number, d: SlipDetails) {
  const pad = 5;
  doc.setLineDashPattern([1.5, 1.2], 0);
  doc.setDrawColor(140, 143, 135);
  doc.roundedRect(x, y, SLIP_WIDTH, SLIP_HEIGHT, 2, 2);
  doc.setLineDashPattern([], 0);

  const left = x + pad;
  doc.setTextColor(...INK).setFont("helvetica", "bold").setFontSize(11);
  doc.text(d.schoolName, left, y + pad + 4, { maxWidth: SLIP_WIDTH - pad * 2 });
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
// bundle. Built-in fonts only (helvetica, courier), so nothing is fetched.
export async function buildPinsPdf(pins: CardPin[], details: SlipDetails): Promise<JsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.setProperties({ title: `Result PINs · ${details.sessionName}`, author: details.schoolName });

  pins.forEach((pin, i) => {
    const { page, x, y } = slipPosition(i);
    if (page >= doc.getNumberOfPages()) doc.addPage();
    drawSlip(doc, pin, x, y, details);
  });
  return doc;
}

export async function downloadPinsPdf(pins: CardPin[], details: SlipDetails): Promise<void> {
  const doc = await buildPinsPdf(pins, details);
  const safeSession = details.sessionName.replace(/[^\w-]+/g, "-");
  saveBlob(doc.output("blob"), `result-pins-${safeSession}.pdf`);
}
