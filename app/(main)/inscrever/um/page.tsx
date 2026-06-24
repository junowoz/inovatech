import type { Metadata } from "next";

import { StepUmForm } from "@/components/inscrever/step-um-form";

export const metadata: Metadata = {
  title: "Inscrever — Informações Básicas",
  robots: { index: false, follow: false },
};

export default function InscreverUmPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <StepUmForm />
    </div>
  );
}
