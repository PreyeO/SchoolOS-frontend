import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SchoolOS — School management built for Nigeria";

export default async function OGImage() {
  // Inlined as a data URI: the image renderer can't fetch a relative URL, and
  // this runs at build time so the file read costs nothing at request time.
  const logo = await readFile(join(process.cwd(), "public/images/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#FBFAF7",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 90px",
          gap: 70,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={380} height={349} alt="" />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ color: "#0E2A24", fontSize: 104, fontWeight: 700, letterSpacing: "-3px" }}>
              School
            </span>
            <span style={{ color: "#F2A93B", fontSize: 104, fontWeight: 700, letterSpacing: "-3px" }}>
              OS
            </span>
          </div>
          <span style={{ color: "rgba(14,42,36,0.70)", fontSize: 38, marginTop: 12 }}>
            School management built for Nigeria
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
