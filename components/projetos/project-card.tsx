import Link from "next/link";

import { firstImageUrl } from "@/lib/media";
import type { ProjectRow } from "@/lib/types/database";
import { ProjectBadges } from "./project-badges";
import { ProjectImage } from "./project-image";

export function ProjectCard({
  project,
  year,
  tech,
  industry,
}: {
  project: ProjectRow;
  year: string;
  tech: string;
  industry: string;
}) {
  return (
    <Link
      href={`/projetos/${encodeURIComponent(project.name)}`}
      className="group block rounded-xl bg-card p-4 shadow-border transition-[box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-border-hover focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="flex items-center gap-4">
        <ProjectImage
          src={firstImageUrl(project.logoImg)}
          alt={`Logo ${project.name}`}
          width={80}
          height={80}
          className="size-16 shrink-0 rounded-full object-cover ring-1 ring-black/10 sm:size-20"
        />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-foreground">
            {project.name}
          </h3>
          {project.slogan ? (
            <p className="mb-2 truncate text-sm text-muted-foreground">
              {project.slogan}
            </p>
          ) : null}
          <ProjectBadges year={year} tech={tech} industry={industry} />
        </div>
      </div>
    </Link>
  );
}
