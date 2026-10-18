// Card serials are always 10 letters/digits shown as XXXX-XXXX-XX
// (ScratchCardService._generate_unique_serial), and the server matches them
// exactly. So the field formats as the parent types: capitals, dashes put in
// for them, anything else dropped. A pasted "abcd efgh ij" comes out right.
export function formatSerialInput(raw: string): string {
  const chars = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  return [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8, 10)].filter(Boolean).join("-");
}

export const SERIAL_LENGTH = 12; // with dashes

// PINs are 10 digits (ScratchCardService._generate_pin).
export function formatPinInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}
