import type { Metadata } from "next";

import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Alterar Senha",
  robots: { index: false, follow: false },
};

export default async function AlterarSenhaPage() {
  await requireAdmin();
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <ChangePasswordForm />
    </div>
  );
}
