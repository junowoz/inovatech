import type { Metadata } from "next";

import { ProjetosBrowser } from "@/components/projetos/projetos-browser";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getLookups, getPublishedProjects } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Projetos",
  description:
    "Diretório de projetos do Inovatech — explore os projetos de empreendedorismo tecnológico desenvolvidos pelos alunos dos cursos de Computação da Fametro.",
  alternates: { canonical: "/projetos" },
};

export default async function ProjetosPage() {
  const [projects, lookups] = await Promise.all([
    getPublishedProjects(),
    getLookups(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Diretório de Projetos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Bem-vindo ao diretório de projetos Inovatech, uma iniciativa do
            Centro Universitário Fametro para divulgar os projetos desenvolvidos
            pelos alunos dos cursos de computação ao longo dos anos.
          </p>
          <p>
            Aqui você pode filtrar os projetos por ano, semestre, tipo de
            tecnologia utilizada, indústria de atuação e muito mais. Não deixe de
            conferir a criatividade e inovação dos nossos alunos!
          </p>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <ProjetosBrowser projects={projects} lookups={lookups} />
    </div>
  );
}
