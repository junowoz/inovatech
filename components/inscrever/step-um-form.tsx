"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useHydrated } from "@/lib/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInscreverStore } from "@/lib/stores/inscrever-store";
import { step1Schema, type Step1Input } from "@/lib/validations/inscrever";
import {
  FieldError,
  FieldLabel,
  RequiredFieldsHeading,
} from "./field-label";
import { InscreverProgress } from "./inscrever-progress";

export function StepUmForm() {
  const router = useRouter();
  const { data, setData, reset } = useInscreverStore();
  const hydrated = useHydrated();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<Step1Input>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: "",
      slogan: "",
      projectDescription: "",
      targetAudience: "",
      productDescription: "",
      projectViability: "",
      link: "",
    },
  });

  useEffect(() => {
    resetForm({
      name: data.name ?? "",
      slogan: data.slogan ?? "",
      projectDescription: data.projectDescription ?? "",
      targetAudience: data.targetAudience ?? "",
      productDescription: data.productDescription ?? "",
      projectViability: data.projectViability ?? "",
      link: data.link ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (values: Step1Input) => {
    setData({ ...values, name: values.name.trim() });
    router.push("/inscrever/dois");
  };

  const handleExit = () => {
    reset();
    router.push("/inscrever");
  };

  if (!hydrated) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <InscreverProgress step={1} />
      <RequiredFieldsHeading />

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <FieldLabel htmlFor="name">Nome do Projeto</FieldLabel>
            <Input
              id="name"
              placeholder="Digite o nome do projeto..."
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <FieldLabel
              htmlFor="slogan"
              hint="Breve introdução ao propósito do projeto. Min: 10, Máx: 100 caracteres."
            >
              Slogan
            </FieldLabel>
            <Input
              id="slogan"
              placeholder="Descreva o projeto em poucas palavras..."
              aria-invalid={Boolean(errors.slogan)}
              {...register("slogan")}
            />
            <FieldError message={errors.slogan?.message} />
          </div>

          <div>
            <FieldLabel
              htmlFor="projectDescription"
              hint="Resumo conciso do projeto: o que faz, qual problema resolve e o que o diferencia. Min: 10, Máx: 1000 caracteres."
            >
              Descrição do Projeto
            </FieldLabel>
            <Textarea
              id="projectDescription"
              rows={4}
              placeholder="Descreva seu projeto em detalhes aqui..."
              aria-invalid={Boolean(errors.projectDescription)}
              {...register("projectDescription")}
            />
            <FieldError message={errors.projectDescription?.message} />
          </div>

          <div>
            <FieldLabel
              htmlFor="targetAudience"
              hint="Quem são os principais usuários ou clientes do seu projeto. Min: 10, Máx: 500 caracteres."
            >
              Público Alvo
            </FieldLabel>
            <Textarea
              id="targetAudience"
              rows={3}
              placeholder="Descreva o público-alvo do seu projeto..."
              aria-invalid={Boolean(errors.targetAudience)}
              {...register("targetAudience")}
            />
            <FieldError message={errors.targetAudience?.message} />
          </div>

          <div>
            <FieldLabel
              htmlFor="productDescription"
              hint="Principais características e funcionalidades do produto, stack de tecnologia e fluxo do usuário. Min: 10, Máx: 1000 caracteres."
            >
              Descrição do Produto
            </FieldLabel>
            <Textarea
              id="productDescription"
              rows={4}
              placeholder="Descreva seu produto em detalhes..."
              aria-invalid={Boolean(errors.productDescription)}
              {...register("productDescription")}
            />
            <FieldError message={errors.productDescription?.message} />
          </div>

          <div>
            <FieldLabel
              htmlFor="projectViability"
              hint="Como o projeto pode se manter e crescer: fontes de receita, monetização e retenção. Min: 10, Máx: 1000 caracteres."
            >
              Viabilidade do Projeto
            </FieldLabel>
            <Textarea
              id="projectViability"
              rows={4}
              placeholder="Descreva a viabilidade do seu projeto..."
              aria-invalid={Boolean(errors.projectViability)}
              {...register("projectViability")}
            />
            <FieldError message={errors.projectViability?.message} />
          </div>

          <div>
            <FieldLabel
              htmlFor="link"
              hint="Se tiver um link para testar o produto, insira-o. Apenas links http/https."
            >
              Link do Produto (opcional)
            </FieldLabel>
            <Input
              id="link"
              placeholder="https://..."
              aria-invalid={Boolean(errors.link)}
              {...register("link")}
            />
            <FieldError message={errors.link?.message} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={handleExit}>
          <ChevronLeft className="size-4" />
          Sair da Inscrição
        </Button>
        <Button type="submit">
          Seguinte
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}
