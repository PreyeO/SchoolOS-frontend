import type { NextConfig } from "next";

// Identifies this build, and through it the service worker's cache generation.
//
// public/sw.js is served byte-for-byte and can't read env vars, so the version
// travels in its registration URL (/sw.js?v=…) and the worker reads it back off
// self.location. A changed URL is what makes the browser install a fresh worker,
// whose activate step then deletes every cache from an older build.
//
// Evaluated once here at build time. The commit SHA on Vercel; a timestamp
// anywhere else, which still changes per build — that's all this needs to do.
const BUILD_ID = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? String(Date.now());

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },

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
