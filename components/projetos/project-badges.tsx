import { Badge } from "@/components/ui/badge";

export function ProjectBadges({
  year,
  tech,
  industry,
}: {
  year?: string;
  tech?: string;
  industry?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {year ? <Badge variant="secondary">{year}</Badge> : null}
      {tech ? <Badge>{tech}</Badge> : null}
      {industry ? (
        <Badge className="border-transparent bg-chart-5 text-white">
          {industry}
        </Badge>
      ) : null}
    </div>
  );
}
