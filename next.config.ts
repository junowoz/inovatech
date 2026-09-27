import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Local `next dev` gets the D1/R2 bindings from wrangler.jsonc through
// miniflare, so the same `getCloudflareContext()` code runs in dev and prod.
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "30mb" } },
  images: {
    // Workers has no Next image optimizer. Media is served as-is from R2
    // via the app's own /midia route (same origin, no remotePatterns needed).
    unoptimized: true,
  },
};

export default nextConfig;
