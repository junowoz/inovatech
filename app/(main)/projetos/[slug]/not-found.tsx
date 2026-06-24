import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ProjetoNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <Image
        src="/Erro404.png"
        alt="Projeto não encontrado"
        width={320}
        height={240}
        className="h-auto w-64"
      />
      <div>
        <h1 className="text-2xl font-bold">Projeto não encontrado</h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          O projeto que você procura não existe ou ainda não foi publicado.
        </p>
      </div>
      <Button asChild variant="brand">
        <Link href="/projetos">Ver todos os projetos</Link>
      </Button>
    </div>
  );
}
