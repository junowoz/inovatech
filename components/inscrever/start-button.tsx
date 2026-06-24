"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useInscreverStore } from "@/lib/stores/inscrever-store";

export function StartInscricaoButton() {
  const router = useRouter();
  const reset = useInscreverStore((s) => s.reset);

  return (
    <Button
      className="w-full"
      onClick={() => {
        reset();
        router.push("/inscrever/um");
      }}
    >
      Inscrever Projeto
    </Button>
  );
}
