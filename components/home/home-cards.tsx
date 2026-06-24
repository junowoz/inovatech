import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    title: "Projetos",
    message: "Explore os projetos apresentados ao longo dos anos.",
    href: "/projetos",
  },
  {
    title: "Inscrever",
    message: "Inscreva seu projeto, aplique, e faça parte do Inovatech.",
    href: "/inscrever",
  },
] as const;

export function HomeCards() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="grid gap-6 sm:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col items-center gap-4 rounded-2xl bg-card p-6 text-center shadow-border sm:p-8 transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-1 hover:shadow-border-hover focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <div>
              <h2 className="text-xl font-bold text-foreground">{card.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {card.message}
              </p>
            </div>
            <span
              className={cn(
                buttonVariants({ variant: "brand", size: "sm" }),
                "pointer-events-none mt-auto"
              )}
            >
              Acessar
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
