import type { Metadata } from "next";

import { StepTresForm } from "@/components/inscrever/step-tres-form";

export const metadata: Metadata = {
  title: "Inscrever — Recursos Visuais",
  robots: { index: false, follow: false },
};

export default function InscreverTresPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <StepTresForm />
    </div>
  );
}
