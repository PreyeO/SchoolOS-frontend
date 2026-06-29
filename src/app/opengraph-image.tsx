import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SchoolOS — School management built for Nigeria";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0E2A24",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 88,
            height: 88,
            background: "#1E5B4F",
            borderRadius: 20,
            marginBottom: 48,
          }}
        >
          <span
            style={{
              color: "#F2A93B",
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            S
          </span>
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: 28,
          }}
        >
          <span
            style={{
              color: "#F6F7F3",
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            School
          </span>
          <span
            style={{
              color: "#F2A93B",
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            OS
          </span>
        </div>

        {/* Tagline */}
        <span
          style={{
            color: "rgba(246,247,243,0.60)",
            fontSize: 38,
            fontWeight: 400,
          }}
        >
          School management built for Nigeria
        </span>
      </div>
    ),
    { ...size },
  );
}
