import type { Metadata } from "next";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { StartInscricaoButton } from "@/components/inscrever/start-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Inscrever",
  description:
    "Inscreva seu projeto no Inovatech e faça parte da feira de inovação tecnológica da Fametro.",
  alternates: { canonical: "/inscrever" },
};

export default function InscreverPage() {
  const hasContact = CONTACT.emailHref || CONTACT.whatsapp;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Inscreva seu projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-pretty">
            Para inscrever seu projeto, siga o processo de inscrição passo a
            passo. Após a inscrição, nosso time de administradores irá revisar e
            aprovar seu projeto. O processo pode levar até 24 horas.
          </p>
          {hasContact ? (
            <p className="text-pretty">
              Se tiver alguma dúvida durante o processo, entre em contato
              {CONTACT.emailHref ? (
                <>
                  {" "}
                  pelo e-mail{" "}
                  <a
                    href={CONTACT.emailHref}
                    className="text-primary hover:underline"
                  >
                    {CONTACT.email}
                  </a>
                </>
              ) : null}
              {CONTACT.emailHref && CONTACT.whatsapp ? " ou" : null}
              {CONTACT.whatsapp ? (
                <>
                  {" "}
                  pelo{" "}
                  <a
                    href={CONTACT.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    WhatsApp
                  </a>
                </>
              ) : null}
              .
            </p>
          ) : null}
          <Alert className="border-yellow-300 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600 dark:border-yellow-900/50 dark:bg-yellow-950/40 dark:text-yellow-200">
            <TriangleAlert />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription className="text-yellow-900 dark:text-yellow-200">
              Antes de inscrever seu projeto, verifique a lista de{" "}
              <Link href="/projetos" className="font-medium underline">
                projetos existentes
              </Link>{" "}
              para garantir que não haja projetos similares já inscritos.
            </AlertDescription>
          </Alert>
          <StartInscricaoButton />
        </CardContent>
      </Card>
    </div>
  );
}
