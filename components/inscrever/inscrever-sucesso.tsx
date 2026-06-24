"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CONTACT } from "@/lib/constants";

export function InscreverSucesso() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(20);
  const hasContact = CONTACT.emailHref || CONTACT.whatsapp;

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12">
      <Card>
        <CardContent className="space-y-4">
          <CircleCheck className="size-12 text-chart-3" />
          <h1 className="text-2xl font-bold text-balance">
            Parabéns! Seu projeto foi registrado com sucesso.
          </h1>
          <p className="text-pretty text-muted-foreground">
            Aguarde até 24 horas para que um administrador aprove sua inscrição.
            Após a aprovação, seu projeto estará disponível na aba{" "}
            <Link href="/projetos" className="text-primary hover:underline">
              projetos
            </Link>
            .
          </p>
          {hasContact ? (
            <>
              <Separator />
              <p className="text-pretty text-muted-foreground">
                Caso haja algum erro ou precise comunicar algo
                {CONTACT.emailHref ? (
                  <>
                    , envie um e-mail para{" "}
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
                    nos chame no{" "}
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
            </>
          ) : null}
          <Alert>
            <AlertDescription>
              Você será redirecionado à tela inicial em{" "}
              <span className="font-medium tabular-nums">{countdown}</span>{" "}
              segundos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
