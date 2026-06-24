import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";
import { getPublishedProjects } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/projetos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/inscrever`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/manual`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/rank`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const projects = await getPublishedProjects();
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE.url}/projetos/${encodeURIComponent(project.name)}`,
    lastModified: project.date ? new Date(project.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
