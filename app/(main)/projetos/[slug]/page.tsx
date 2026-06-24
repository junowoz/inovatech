import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ProjectAside,
  ProjectHeader,
  ProjectInfo,
  ProjectLink,
  ProjectMedia,
  ProjectMembers,
} from "@/components/projetos/project-detail";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/lib/constants";
import { firstImageUrl } from "@/lib/media";
import {
  getLookups,
  getProjectBySlug,
  getProjectMembers,
} from "@/lib/supabase/queries";

type PageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(decodeURIComponent(slug));

  if (!project) {
    return { title: "Projeto não encontrado", robots: { index: false } };
  }

  const title = project.slogan
    ? `${project.name}: ${project.slogan}`
    : project.name;
  const description = project.slogan ?? SITE.description;
  const canonical = `/projetos/${encodeURIComponent(project.name)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${SITE.url}${canonical}`,
      images: [firstImageUrl(project.logoImg, SITE.wordmark)],
    },
  };
}

export default async function ProjetoPage({ params }: PageParams) {
  const { slug } = await params;
  const project = await getProjectBySlug(decodeURIComponent(slug));

  if (!project) notFound();

  const [members, lookups] = await Promise.all([
    getProjectMembers(project.projectUUID),
    getLookups(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/projetos">Projetos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <ProjectHeader project={project} lookups={lookups} />
          <Separator className="my-6" />
          {project.link ? (
            <>
              <ProjectLink link={project.link} />
              <Separator className="my-6" />
            </>
          ) : null}
          <ProjectInfo project={project} />
          <Separator className="my-6" />
          <ProjectMedia project={project} />
        </div>

        <aside className="space-y-6">
          <ProjectAside project={project} lookups={lookups} />
          <ProjectMembers members={members} />
        </aside>
      </div>
    </div>
  );
}
