import type { Metadata } from "next";
import Image from "next/image";

import { HomeCards } from "@/components/home/home-cards";
import { ProjectSearch } from "@/components/home/project-search";
import { SITE } from "@/lib/constants";
import { getPublishedProjects } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const projects = await getPublishedProjects();
  const searchable = projects.map((p) => ({ name: p.name, slogan: p.slogan }));

  return (
    <>
      <section className="bg-hero">
        <div className="bg-[linear-gradient(rgba(255,255,255,0.78),rgba(255,255,255,0.78)),url('/People.JPG')] bg-cover bg-left">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
                <h1 className="max-w-xl animate-in fade-in-0 slide-in-from-bottom-2 text-center text-2xl font-bold text-balance text-brand-ink duration-700 sm:text-3xl lg:text-left">
                  {SITE.description}
                </h1>
              </div>
              <div className="order-1 flex justify-center lg:order-2">
                <Image
                  src={SITE.wordmark}
                  alt={SITE.name}
                  width={520}
                  height={312}
                  priority
                  className="h-auto w-3/4 max-w-sm animate-in fade-in-0 zoom-in-95 duration-700"
                />
              </div>
            </div>

            <div className="mx-auto mt-12 max-w-xl animate-in fade-in-0 slide-in-from-bottom-2 duration-700 [animation-delay:150ms]">
              <ProjectSearch projects={searchable} />
            </div>
          </div>
        </div>
      </section>

      <HomeCards />
    </>
  );
}
