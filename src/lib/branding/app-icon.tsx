import { ImageResponse } from "next/og";

// The SchoolOS mark, rendered at whatever size the caller needs. Matches
// src/app/icon.svg and apple-icon.tsx so the installed app, the favicon and the
// Apple touch icon are visibly the same product.
const INK = "#0E2A24";
const AMBER = "#F2A93B";

interface Options {
  size: number;
  // Maskable icons are cropped to whatever shape the OS prefers — a circle on
  // most Android launchers. The mark has to sit inside the middle 80% or it gets
  // clipped, and the tile must fill the canvas squarely since the launcher
  // supplies its own rounding.
  maskable?: boolean;
}

export function renderAppIcon({ size, maskable = false }: Options): ImageResponse {
  const scale = maskable ? 0.55 : 0.68;

  return new ImageResponse(
    (
      <div
        style={{
          background: INK,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: maskable ? 0 : `${Math.round(size * 0.22)}px`,
        }}
      >
        <span
          style={{
            color: AMBER,
            fontSize: Math.round(size * scale),
            fontWeight: 800,
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1,
          }}
        >
          S
        </span>
      </div>
    ),
    { width: size, height: size },
  );
}
