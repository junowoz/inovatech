import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="p-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <Home className="size-4" />
            Início
          </Link>
        </Button>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {year} {SITE.name}
      </footer>
    </div>
  );
}
