"use client";

import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateProjectAction } from "@/app/actions/admin";
import { FieldError } from "@/components/inscrever/field-label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Lookups, ProjectRow } from "@/lib/types/database";
import {
  editProjectFormSchema,
  type EditProjectFormValues,
} from "@/lib/validations/admin";

const LOOKUP_FIELDS = [
  { key: "year", label: "Ano" },
  { key: "semester", label: "Período" },
  { key: "course", label: "Curso" },
  { key: "tech", label: "Tecnologia" },
  { key: "industry", label: "Indústria" },
] as const;

const TEXT_AREAS = [
  { key: "projectDescription", label: "Descrição" },
  { key: "targetAudience", label: "Público Alvo" },
  { key: "productDescription", label: "Descrição do Produto" },
  { key: "projectViability", label: "Viabilidade" },
] as const;

export function EditProjectDialog({
  project,
  lookups,
  open,
  onOpenChange,
}: {
  project: ProjectRow | null;
  lookups: Lookups;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectFormSchema),
  });

  useEffect(() => {
    if (!project) return;
    reset({
      name: project.name,
      slogan: project.slogan ?? "",
      projectDescription: project.projectDescription ?? "",
      targetAudience: project.targetAudience ?? "",
      productDescription: project.productDescription ?? "",
      projectViability: project.projectViability ?? "",
      link: project.link ?? "",
      year: project.year ? String(project.year) : "",
      semester: project.semester ? String(project.semester) : "",
      course: project.course ? String(project.course) : "",
      tech: project.tech ? String(project.tech) : "",
      industry: project.industry ? String(project.industry) : "",
      status: project.status,
    });
  }, [project, reset]);

  if (!project) return null;

  const onSubmit = (values: EditProjectFormValues) => {
    startTransition(async () => {
      const result = await updateProjectAction(project.id, values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Projeto atualizado.");
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar projeto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome</Label>
            <Input id="edit-name" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <Label htmlFor="edit-slogan">Slogan</Label>
            <Input id="edit-slogan" {...register("slogan")} />
            <FieldError message={errors.slogan?.message} />
          </div>

          {TEXT_AREAS.map((field) => (
            <div key={field.key}>
              <Label htmlFor={`edit-${field.key}`}>{field.label}</Label>
              <Textarea
                id={`edit-${field.key}`}
                rows={3}
                {...register(field.key)}
              />
            </div>
          ))}

          <div>
            <Label htmlFor="edit-link">Link</Label>
            <Input id="edit-link" {...register("link")} />
            <FieldError message={errors.link?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {LOOKUP_FIELDS.map((field) => (
              <div key={field.key}>
                <Label htmlFor={`edit-${field.key}`}>{field.label}</Label>
                <Controller
                  name={field.key}
                  control={control}
                  render={({ field: f }) => (
                    <Select value={f.value} onValueChange={f.onChange}>
                      <SelectTrigger id={`edit-${field.key}`} className="w-full">
                        <SelectValue placeholder={`Selecionar ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {lookups[field.key].map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors[field.key]?.message} />
              </div>
            ))}
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field: f }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-status"
                  checked={f.value}
                  onCheckedChange={(v) => f.onChange(Boolean(v))}
                />
                <Label htmlFor="edit-status" className="font-normal">
                  Publicado
                </Label>
              </div>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
