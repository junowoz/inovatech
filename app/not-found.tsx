import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Image
        src="/Erro404.png"
        alt="Página não encontrada"
        width={420}
        height={300}
        className="h-auto w-full max-w-sm"
        priority
      />
      <h1 className="text-2xl font-bold text-primary">Página não encontrada</h1>
      <Button asChild>
        <Link href="/">Voltar ao Início</Link>
      </Button>
    </div>
  );
}
