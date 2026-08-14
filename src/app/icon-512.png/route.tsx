import { renderAppIcon } from "@/lib/branding/app-icon";

export const contentType = "image/png";
export const dynamic = "force-static";

export function GET() {
  return renderAppIcon({ size: 512 });
}
