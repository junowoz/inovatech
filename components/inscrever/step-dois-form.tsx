"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasStep1, useInscreverStore } from "@/lib/stores/inscrever-store";
import type { Lookups } from "@/lib/types/database";
import { step2Schema, type Step2Input } from "@/lib/validations/inscrever";
import {
  FieldError,
  FieldLabel,
  RequiredFieldsHeading,
} from "./field-label";
import { InscreverProgress } from "./inscrever-progress";

const FIELDS = [
  {
    key: "year",
    label: "Ano",
    placeholder: "Selecionar ano",
    hint: "Ano da edição do Inovatech em que o projeto foi apresentado.",
  },
  {
    key: "semester",
    label: "Período",
    placeholder: "Selecionar período",
    hint: "Período em que você estava ao apresentar o projeto.",
  },
  {
    key: "course",
    label: "Curso de graduação",
    placeholder: "Selecione um curso",
    hint: "Curso de graduação dos alunos que desenvolveram o projeto.",
  },
  {
    key: "tech",
    label: "Tecnologia",
    placeholder: "Selecionar tecnologia",
    hint: "Tecnologia principal que o projeto utiliza.",
  },
  {
    key: "industry",
    label: "Industria",
    placeholder: "Selecionar industria",
    hint: "Indústria ou setor no qual o projeto opera.",
  },
] as const;

export function StepDoisForm({ lookups }: { lookups: Lookups }) {
  const router = useRouter();
  const setData = useInscreverStore((s) => s.setData);
  const hydrated = useHydrated();

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<Step2Input>({
    resolver: zodResolver(step2Schema),
    defaultValues: { year: "", semester: "", course: "", tech: "", industry: "" },
  });

  useEffect(() => {
    const current = useInscreverStore.getState().data;
    if (!hasStep1(current)) {
      router.replace("/inscrever/um");
      return;
    }
    reset({
      year: current.year ?? "",
      semester: current.semester ?? "",
      course: current.course ?? "",
      tech: current.tech ?? "",
      industry: current.industry ?? "",
    });
  }, [router, reset]);

  const onSubmit = (values: Step2Input) => {
    setData(values);
    router.push("/inscrever/tres");
  };

  const handleBack = () => {
    setData(getValues());
    router.push("/inscrever/um");
  };

  if (!hydrated) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <InscreverProgress step={2} />
      <RequiredFieldsHeading />

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Informações Específicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <FieldLabel htmlFor={field.key} hint={field.hint}>
                {field.label}
              </FieldLabel>
              <Controller
                name={field.key}
                control={control}
                render={({ field: f }) => (
                  <Select value={f.value} onValueChange={f.onChange}>
                    <SelectTrigger
                      id={field.key}
                      className="w-full"
                      aria-invalid={Boolean(errors[field.key])}
                    >
                      <SelectValue placeholder={field.placeholder} />
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
