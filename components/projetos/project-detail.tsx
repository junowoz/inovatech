import { ExternalLink, Mail } from "lucide-react";

import { LinkedinIcon } from "@/components/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { lookupName } from "@/lib/lookups";
import { firstImageUrl, imageUrls } from "@/lib/media";
import {
  contactHref,
  contactKind,
  normalizeMembers,
} from "@/lib/members";
import type { Lookups, MemberRow, ProjectRow } from "@/lib/types/database";
import { ProjectBadges } from "./project-badges";
import { ProjectImage } from "./project-image";

/** Allow only http(s) links; coerce bare domains, reject other schemes. */
function safeExternalUrl(link: string | null): string | null {
  if (!link) return null;
  const trimmed = link.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;
  return `https://${trimmed}`;
}

export function ProjectHeader({
  project,
  lookups,
}: {
  project: ProjectRow;
  lookups: Lookups;
}) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <ProjectImage
        src={firstImageUrl(project.logoImg)}
        alt={`Logo ${project.name}`}
        width={120}
        height={120}
        className="size-24 shrink-0 rounded-full object-cover ring-1 ring-black/10"
      />
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-balance text-foreground sm:text-3xl">
          {project.name}
        </h1>
        {project.slogan ? (
          <p className="mt-1 text-muted-foreground">{project.slogan}</p>
        ) : null}
        <div className="mt-3 flex justify-center sm:justify-start">
          <ProjectBadges
            year={lookupName(lookups.year, project.year)}
            tech={lookupName(lookups.tech, project.tech)}
            industry={lookupName(lookups.industry, project.industry)}
          />
        </div>
      </div>
    </div>
  );
}

export function ProjectLink({ link }: { link: string | null }) {
  const href = safeExternalUrl(link);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
    >
      <ExternalLink className="size-4" />
      Link do projeto
    </a>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div>
      <h2 className="mb-1 font-semibold text-primary">{title}</h2>
      <p className="text-pretty whitespace-pre-line text-foreground/90">
        {children}
      </p>
    </div>
  );
}

export function ProjectInfo({ project }: { project: ProjectRow }) {
  return (
    <div className="space-y-5">
      <InfoSection title="Descrição">{project.projectDescription}</InfoSection>
      <InfoSection title="Público Alvo">{project.targetAudience}</InfoSection>
      <InfoSection title="Viabilidade">{project.projectViability}</InfoSection>
      <InfoSection title="Descrição do Produto">
        {project.productDescription}
      </InfoSection>
    </div>
  );
}

export function ProjectMedia({ project }: { project: ProjectRow }) {
  const products = imageUrls(project.productImg);
  const team = firstImageUrl(project.teamImg, "");

  if (products.length === 0 && !team) return null;

  return (
    <div className="space-y-6">
      {products.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Produto
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <ProjectImage
                  src={url}
                  alt={`Produto ${index + 1}`}
                  width={400}
                  height={300}
                  className="img-outline aspect-square w-full rounded-lg object-cover transition-[filter] hover:brightness-95"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {team && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Time
          </h2>
          <a href={team} target="_blank" rel="noopener noreferrer">
            <ProjectImage
              src={team}
              alt={`Time do projeto ${project.name}`}
              width={800}
              height={500}
              className="img-outline w-full rounded-lg object-cover"
            />
          </a>
        </div>
      )}
    </div>
  );
}

export function ProjectAside({
  project,
  lookups,
}: {
  project: ProjectRow;
  lookups: Lookups;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Ano:</span>{" "}
          {lookupName(lookups.year, project.year)}
        </p>
        <p>
          <span className="font-medium text-foreground">Curso:</span>{" "}
          {lookupName(lookups.course, project.course)}
        </p>
        <p>
          <span className="font-medium text-foreground">Período:</span>{" "}
          {lookupName(lookups.semester, project.semester)}
        </p>
      </CardContent>
    </Card>
  );
}

export function ProjectMembers({ members }: { members: MemberRow[] }) {
  const { leaders, commonNames } = normalizeMembers(members);

  if (leaders.length === 0 && commonNames.length === 0) return null;

  return (
    <div className="space-y-4">
      {leaders.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            {leaders.length > 1 ? "Fundadores" : "Fundador"}
          </h2>
          <div className="space-y-2">
            {leaders.map((leader) => {
              const kind = contactKind(leader.contact);
              return (
                <Card key={leader.id}>
                  <CardContent className="flex items-center gap-3">
                    {leader.contact && kind ? (
                      <a
                        href={contactHref(leader.contact)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={
                          kind === "linkedin" ? "LinkedIn" : "Email"
                        }
                        className="text-primary transition-colors hover:text-primary/80"
                      >
                        {kind === "linkedin" ? (
                          <LinkedinIcon className="size-5" />
                        ) : (
                          <Mail className="size-5" />
                        )}
                      </a>
                    ) : null}
                    <div>
                      <p className="font-medium">{leader.names.join(", ")}</p>
                      <p className="text-sm text-muted-foreground">
                        {leader.isFounder ? "Fundador" : "Cofundador"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {commonNames.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Membros
          </h2>
          <Card>
            <CardContent className="space-y-1 text-sm">
              {commonNames.map((name, index) => (
                <p key={`${name}-${index}`}>{name}</p>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
