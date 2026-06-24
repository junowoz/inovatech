"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ArrowDownUp,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteProjectAction, setProjectsStatus } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SmartPagination } from "@/components/ui/smart-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Lookups, ProjectRow } from "@/lib/types/database";
import { EditProjectDialog } from "./edit-project-dialog";

const PER_PAGE = 10;

type SortKey = "name" | "date" | "status";
interface SortConfig {
  key: SortKey;
  direction: "asc" | "desc";
}

export function DashboardClient({
  projects,
  lookups,
}: {
  projects: ProjectRow[];
  lookups: Lookups;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<ProjectRow | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = projects.filter((p) => p.name.toLowerCase().includes(term));
    if (sort) {
      rows.sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (av < bv) return sort.direction === "asc" ? -1 : 1;
        if (av > bv) return sort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [projects, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const current = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const requestSort = (key: SortKey) =>
    setSort((prev) =>
      prev?.key === key && prev.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" }
    );

  const toggleSelect = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const allVisibleSelected =
    current.length > 0 && current.every((p) => selected.includes(p.id));

  const toggleSelectAll = () =>
    setSelected((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !current.some((p) => p.id === id))
        : [...new Set([...prev, ...current.map((p) => p.id)])]
    );

  const setStatus = (ids: number[], status: boolean) =>
    startTransition(async () => {
      const result = await setProjectsStatus(ids, status);
      if (result.error) toast.error(result.error);
      else {
        toast.success(status ? "Projeto(s) publicado(s)." : "Projeto(s) despublicado(s).");
        setSelected([]);
      }
    });

  const confirmDelete = () =>
    startTransition(async () => {
      if (deleteTarget == null) return;
      const result = await deleteProjectAction(deleteTarget);
      if (result.error) toast.error(result.error);
      else toast.success("Projeto excluído.");
      setDeleteTarget(null);
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Atualizar"
          onClick={() => router.refresh()}
        >
          <RefreshCw className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ArrowDownUp className="size-4" />
              Ordenar por
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => requestSort("name")}>
              Nome
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => requestSort("date")}>
              Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => requestSort("status")}>
              Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm sm:flex-row sm:items-center">
          <span className="font-medium tabular-nums">
            {selected.length} selecionado(s)
          </span>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <Button size="sm" onClick={() => setStatus(selected, true)} disabled={pending}>
              Publicar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStatus(selected, false)}
              disabled={pending}
            >
              Despublicar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              Limpar
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-border">
        <Table className="min-w-[680px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Administrar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {current.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              current.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(project.id)}
                      onCheckedChange={() => toggleSelect(project.id)}
                      aria-label={`Selecionar ${project.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {new Date(project.date).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {project.status ? (
                      <Badge className="border-transparent bg-chart-3 text-white">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Não publicado</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus([project.id], !project.status)}
                        disabled={pending}
                      >
                        {project.status ? "Despublicar" : "Publicar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditTarget(project)}
                      >
                        <Pencil className="size-3.5" />
                        Revisar
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="destructive"
                        aria-label="Excluir"
                        onClick={() => setDeleteTarget(project.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SmartPagination
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir projeto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este projeto? Esta ação é
              irreversível e deletará todos os dados e imagens associados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditProjectDialog
        project={editTarget}
        lookups={lookups}
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
      />
    </div>
  );
}
