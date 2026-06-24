import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/login", "/inscrever/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
