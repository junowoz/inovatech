"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchableProject {
  name: string;
  slogan: string | null;
}

export function ProjectSearch({ projects }: { projects: SearchableProject[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const go = (name: string) =>
    router.push(`/projetos/${encodeURIComponent(name)}`);

  return (
    <Command
      shouldFilter
      className="overflow-visible rounded-xl border border-border bg-background shadow-border"
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Pesquisar projetos..."
      />
      {query.length > 0 && (
        <CommandList className="max-h-64">
          <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
          <CommandGroup>
            {projects.map((project) => (
              <CommandItem
                key={project.name}
                value={project.name}
                onSelect={() => go(project.name)}
                className="cursor-pointer"
              >
                <span className="font-medium">{project.name}</span>
                {project.slogan ? (
                  <span className="ml-2 truncate text-xs text-muted-foreground">
                    {project.slogan}
                  </span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );
}
