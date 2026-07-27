import { pickReadableForeground } from "@/lib/contrast";

interface Props {
  primary: string;
  accent: string;
}

// A live mockup of the three places these colors actually land in the
// dashboard — sidebar background, the sidebar's own active-item highlight,
// a primary-action button, and a card icon badge — so an admin can judge a
// color choice before saving instead of discovering it across five screens.
export function BrandingPreview({ primary, accent }: Props) {
  const primaryFg = pickReadableForeground(primary);
  const accentFg = pickReadableForeground(accent);
  const tint = `color-mix(in srgb, ${primary} 12%, white)`;

  return (
    <div className="overflow-hidden rounded-xl border border-n-200">
      <div className="flex">
        <div className="w-28 shrink-0 space-y-2.5 p-3" style={{ backgroundColor: primary }}>
          <div className="h-2 w-14 rounded-full opacity-70" style={{ backgroundColor: primaryFg }} />
          <div
            className="rounded-md px-2 py-1 text-[10px] font-medium"
            style={{ backgroundColor: accent, color: accentFg }}
          >
            Dashboard
          </div>
          <div className="h-2 w-12 rounded-full opacity-35" style={{ backgroundColor: primaryFg }} />
          <div className="h-2 w-10 rounded-full opacity-35" style={{ backgroundColor: primaryFg }} />
        </div>
        <div className="flex-1 space-y-2.5 bg-n-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="h-2 w-16 rounded-full bg-n-200" />
            <span
              className="rounded-md px-2.5 py-1 text-[10px] font-semibold"
              style={{ backgroundColor: primary, color: primaryFg }}
            >
              Save changes
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-n-200 bg-white p-2">
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded-md text-[10px]"
              style={{ backgroundColor: tint, color: primary }}
            >
              ●
            </span>
            <div className="h-2 flex-1 rounded-full bg-n-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
