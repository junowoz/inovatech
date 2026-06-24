"use client";

import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SmartPagination } from "@/components/ui/smart-pagination";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toLabelMap } from "@/lib/lookups";
import type { Lookups, ProjectRow } from "@/lib/types/database";
import {
  EMPTY_FILTERS,
  FILTER_SECTIONS,
  FilterPanel,
  type FilterCategory,
  type SelectedFilters,
} from "./filter-panel";
import { ProjectCard } from "./project-card";

const PER_PAGE = 10;

function projectMatches(
  project: ProjectRow,
  search: string,
  selected: SelectedFilters
) {
  const term = search.trim().toLowerCase();
  if (term && !project.name.toLowerCase().includes(term)) return false;

  for (const { key } of FILTER_SECTIONS) {
    const chosen = selected[key];
    if (chosen.length > 0) {
      const value = project[key];
      if (typeof value !== "number" || !chosen.includes(value)) return false;
    }
  }
  return true;
}

export function ProjetosBrowser({
  projects,
  lookups,
}: {
  projects: ProjectRow[];
  lookups: Lookups;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  const labelMaps = useMemo(
    () => ({
      year: toLabelMap(lookups.year),
      tech: toLabelMap(lookups.tech),
      industry: toLabelMap(lookups.industry),
    }),
    [lookups]
  );

  const toggle = (category: FilterCategory, id: number) => {
    setSelected((prev) => {
      const chosen = prev[category];
      const next = chosen.includes(id)
        ? chosen.filter((value) => value !== id)
        : [...chosen, id];
      return { ...prev, [category]: next };
    });
    setPage(1);
  };

  const clear = () => {
    setSelected(EMPTY_FILTERS);
    setPage(1);
  };

  const filtered = useMemo(
    () => projects.filter((p) => projectMatches(p, search, selected)),
    [projects, search, selected]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const current = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const activeFilterCount = Object.values(selected).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        <Card className="p-4">
          <FilterPanel
            lookups={lookups}
            selected={selected}
            onToggle={toggle}
          />
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="mt-2 w-full"
            >
              Limpar filtros
            </Button>
          )}
        </Card>
      </aside>

      <div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar projetos..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="size-4" />
                Filtro
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="px-4">
                <FilterPanel
                  lookups={lookups}
                  selected={selected}
                  onToggle={toggle}
                />
              </div>
              <SheetFooter className="flex-row gap-2">
                <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                  Aplicar
                </Button>
                <Button variant="outline" className="flex-1" onClick={clear}>
                  Limpar
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <p className="mt-4 mb-3 text-sm text-muted-foreground">
          <span className="tabular-nums">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "resultado" : "resultados"}
        </p>

        {current.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            Nenhum projeto encontrado.
          </Card>
        ) : (
          <div className="space-y-3">
            {current.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                year={labelMaps.year.get(project.year ?? -1) ?? ""}
                tech={labelMaps.tech.get(project.tech ?? -1) ?? ""}
                industry={labelMaps.industry.get(project.industry ?? -1) ?? ""}
              />
            ))}
          </div>
        )}

        <SmartPagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-6"
        />
      </div>
    </div>
  );
}
