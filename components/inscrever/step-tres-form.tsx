"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import {
  hasStep1,
  hasStep2,
  useInscreverStore,
} from "@/lib/stores/inscrever-store";
import { isSquareImage, validateImageFile } from "@/lib/validations/inscrever";
import {
  FieldError,
  FieldLabel,
  RequiredFieldsHeading,
} from "./field-label";
import { InscreverProgress } from "./inscrever-progress";

interface FileErrors {
  logo?: string;
  team?: string;
  product?: string;
}

const ACCEPT = ".jpeg,.jpg,.png,.svg";

function SelectedNames({ files }: { files: File[] }) {
  if (files.length === 0) return null;
  return (
    <p className="mt-1 truncate text-xs text-muted-foreground">
      {files.map((f) => f.name).join(", ")}
    </p>
  );
}

export function StepTresForm() {
  const router = useRouter();
  const setFiles = useInscreverStore((s) => s.setFiles);
  const hydrated = useHydrated();
  const [logo, setLogo] = useState<File[]>(
    () => useInscreverStore.getState().files.logo
  );
  const [team, setTeam] = useState<File[]>(
    () => useInscreverStore.getState().files.team
  );
  const [product, setProduct] = useState<File[]>(
    () => useInscreverStore.getState().files.product
  );
  const [errors, setErrors] = useState<FileErrors>({});

  useEffect(() => {
    const state = useInscreverStore.getState();
    if (!hasStep1(state.data) || !hasStep2(state.data)) {
      router.replace("/inscrever/um");
    }
  }, [router]);

  const pick =
    (setter: (files: File[]) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (list && list.length > 0) setter(Array.from(list));
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FileErrors = {};

    if (logo.length !== 1) {
      next.logo = "Selecione ao menos 1 imagem.";
    } else {
      const v = validateImageFile(logo[0]);
      if (v) next.logo = v;
      else if (!(await isSquareImage(logo[0])))
        next.logo = "A imagem deve ser quadrada (mesmas dimensões).";
    }

    if (team.length !== 1) {
      next.team = "Selecione apenas 1 foto.";
    } else {
      const v = validateImageFile(team[0]);
      if (v) next.team = v;
    }

    if (product.length < 1 || product.length > 3) {
      next.product = "Selecione entre 1 e 3 imagens.";
    } else {
      for (const file of product) {
        const v = validateImageFile(file);
        if (v) {
          next.product = v;
          break;
        }
      }
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setFiles({ logo, team, product });
    router.push("/inscrever/finalizar");
  };

  const handleBack = () => {
    setFiles({ logo, team, product });
    router.push("/inscrever/dois");
  };

  if (!hydrated) return null;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <InscreverProgress step={3} />
      <RequiredFieldsHeading />

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Recursos Visuais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <FieldLabel
              htmlFor="logoImg"
              hint="A logo deve ser quadrada (ex: 160x160, 280x280). Formatos recomendados: PNG e SVG."
            >
              Logo do Projeto
            </FieldLabel>
            <Input
              id="logoImg"
              type="file"
              accept={ACCEPT}
              onChange={pick(setLogo)}
              aria-invalid={Boolean(errors.logo)}
            />
            <SelectedNames files={logo} />
            <FieldError message={errors.logo} />
          </div>

          <div>
            <FieldLabel
              htmlFor="teamImg"
              hint="Idealmente a foto mostra a equipe construindo o projeto. Se não tiver, use uma foto dos responsáveis."
            >
              Foto do Time
            </FieldLabel>
            <Input
              id="teamImg"
              type="file"
              accept={ACCEPT}
              onChange={pick(setTeam)}
              aria-invalid={Boolean(errors.team)}
            />
            <SelectedNames files={team} />
            <FieldError message={errors.team} />
          </div>

          <div>
            <FieldLabel
              htmlFor="productImg"
              hint="As imagens devem destacar as principais características e benefícios do produto."
            >
              Imagens do Produto (até 3)
            </FieldLabel>
            <Input
              id="productImg"
              type="file"
              multiple
              accept={ACCEPT}
              onChange={pick(setProduct)}
              aria-invalid={Boolean(errors.product)}
            />
            <SelectedNames files={product} />
            <FieldError message={errors.product} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ChevronLeft className="size-4" />
          Voltar
        </Button>
        <Button type="submit">
          Seguinte
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}
