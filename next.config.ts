import type { NextConfig } from "next";

/**
 * Derive the Supabase storage hostname from the public URL so next/image can
 * optimize remote media without hardcoding a project ref.
 */
function supabaseRemotePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    return [
      {
        protocol: "https" as const,
        hostname: new URL(url).hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [...supabaseRemotePattern()],
  },
};

export default nextConfig;
