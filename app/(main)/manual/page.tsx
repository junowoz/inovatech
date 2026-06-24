import type { Metadata } from "next";
import { Info } from "lucide-react";

import { DownloadPacote } from "@/components/manual/download-pacote";
import { ManualMobileToc } from "@/components/manual/manual-mobile-toc";
import { ManualToc } from "@/components/manual/manual-toc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import manualData from "./manual-data.json";

export const metadata: Metadata = {
  title: "Manual",
  description:
    "Manual do Inovatech — guia com informações e materiais para participar da feira de inovação tecnológica da Fametro.",
  alternates: { canonical: "/manual" },
};

const sections = manualData.sections.map((s) => ({ id: s.id, title: s.title }));

export default function ManualPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Alert className="mb-6">
        <Info />
        <AlertTitle>Manual</AlertTitle>
        <AlertDescription>
          <p>
            Este é um manual para a Feira de Inovação{" "}
            <strong>Inovatech</strong>, evento anual da Fametro que reúne
            estudantes, professores e entusiastas da tecnologia para promover a
            inovação e o desenvolvimento de novas ideias.
          </p>
          <p>
            Para começar, recomendamos baixar alguns documentos importantes:
            Resumo Expandido, Modelo de Visão Geral do Projeto, Modelo de Banner
            e Modelo de Camisas.
          </p>
          <DownloadPacote />
        </AlertDescription>
      </Alert>

      <div className="mb-6">
        <ManualMobileToc sections={sections} />
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_260px]">
        <Card>
          <CardContent className="space-y-8">
            {manualData.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="mb-2 text-xl font-bold">{section.title}</h2>
                <p className="text-pretty whitespace-pre-line text-muted-foreground">
                  {section.content}
                </p>
              </section>
            ))}
          </CardContent>
        </Card>

        <aside className="hidden md:block">
          <div className="sticky top-20">
            <ManualToc sections={sections} />
          </div>
        </aside>
      </div>
    </div>
  );
}
