import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // public/ is served with `Cache-Control: public, max-age=0` by default,
        // which browsers may still heuristically cache. A stale sw.js can pin an
        // old cache version on a device indefinitely, so this is the one asset
        // that must never be served from cache — per Next's own PWA guide.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
