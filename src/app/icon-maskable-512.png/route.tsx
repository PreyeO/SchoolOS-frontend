import { renderAppIcon } from "@/lib/branding/app-icon";

export const contentType = "image/png";
export const dynamic = "force-static";

// Separate from the "any" icon on purpose: a maskable icon is cropped by the
// launcher, so it needs a squared-off tile and a smaller mark. Declaring one
// image as both "any maskable" makes it look wrong in at least one context.
export function GET() {
  return renderAppIcon({ size: 512, maskable: true });
}
