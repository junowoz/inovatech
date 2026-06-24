import type { Metadata } from "next";

import { StepDoisForm } from "@/components/inscrever/step-dois-form";
import { getLookups } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Inscrever — Informações Específicas",
  robots: { index: false, follow: false },
};

export default async function InscreverDoisPage() {
  const lookups = await getLookups();
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <StepDoisForm lookups={lookups} />
    </div>
  );
}
