import type { Metadata } from "next";

import { StepFinalizarForm } from "@/components/inscrever/step-finalizar-form";

export const metadata: Metadata = {
  title: "Inscrever — Finalizar",
  robots: { index: false, follow: false },
};

export default function InscreverFinalizarPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <StepFinalizarForm />
    </div>
  );
}
