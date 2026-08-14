import { renderAppIcon } from "@/lib/branding/app-icon";

export const contentType = "image/png";
// Prerendered at build: the mark never changes at runtime, and an install
// prompt shouldn't wait on a server render to show an icon.
export const dynamic = "force-static";

// Served at /icon-192.png and referenced from the web app manifest. Generated
// rather than checked in as a binary so it can never drift from the brand marks
// in src/app/icon.svg and apple-icon.tsx.
export function GET() {
  return renderAppIcon({ size: 192 });
}
