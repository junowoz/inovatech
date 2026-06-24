import type { Metadata } from "next";
import { Trophy } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Rank",
  description:
    "Ranking dos melhores projetos por curso apresentados no Inovatech.",
  alternates: { canonical: "/rank" },
};

const RANKING = [
  {
    title: "Engenharia da Computação",
    positions: [
      { place: 1, name: "Projeto A" },
      { place: 2, name: "Projeto B" },
      { place: 3, name: "Projeto C" },
    ],
  },
  {
    title: "Engenharia de Software",
    positions: [
      { place: 1, name: "Projeto D" },
      { place: 2, name: "Projeto E" },
      { place: 3, name: "Projeto F" },
    ],
  },
  {
    title: "Sistemas de Informação",
    positions: [
      { place: 1, name: "Projeto G" },
      { place: 2, name: "Projeto H" },
      { place: 3, name: "Projeto I" },
    ],
  },
  {
    title: "Análise e Desenvolvimento de Sistemas",
    positions: [
      { place: 1, name: "Projeto J" },
      { place: 2, name: "Projeto K" },
      { place: 3, name: "Projeto L" },
    ],
  },
];

export default function RankPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Alert className="mb-6">
        <Trophy />
        <AlertDescription>
          É com grande satisfação que anunciamos os vencedores do Inovatech.
          Parabéns a todos os participantes!
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {RANKING.map((course) => (
          <Card key={course.title}>
            <CardHeader>
              <CardTitle className="text-lg">{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {course.positions.map((position) => (
                <div
                  key={position.place}
                  className="flex items-center gap-2 rounded-md border border-border p-3"
                >
                  <Trophy className="size-4 text-yellow-500" />
                  <strong className="tabular-nums">{position.place}</strong>
                  <span className="text-muted-foreground">|</span>
                  <span>{position.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
