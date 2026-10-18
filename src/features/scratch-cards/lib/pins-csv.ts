import { saveBlob } from "@/lib/api/save-blob";
import { csvLines } from "@/lib/text/csv-cell";

import type { CardPin } from "../types";

// The file a school keeps after buying cards: one row per card, ready to print
// as slips or mail-merge. Session included so a file found months later still
// says which year the cards are for.
export function buildPinsCsv(pins: CardPin[], sessionName: string): string {
  return csvLines([["serial", "pin", "session"], ...pins.map((p) => [p.serial, p.pin, sessionName])]);
}

export function downloadPinsCsv(pins: CardPin[], sessionName: string): void {
  const blob = new Blob([buildPinsCsv(pins, sessionName)], { type: "text/csv;charset=utf-8;" });
  const safeSession = sessionName.replace(/[^\w-]+/g, "-");
  saveBlob(blob, `scratch-card-pins-${safeSession}.csv`);
}
