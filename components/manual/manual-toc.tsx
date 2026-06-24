"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
}

export function ManualToc({
  sections,
  onNavigate,
}: {
  sections: Section[];
  onNavigate?: () => void;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="flex flex-col gap-1">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={onNavigate}
          className={cn(
            "rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            active === section.id
              ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              : "text-muted-foreground"
          )}
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}
