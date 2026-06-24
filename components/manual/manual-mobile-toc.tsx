"use client";

import { useState } from "react";
import { List } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ManualToc } from "./manual-toc";

export function ManualMobileToc({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full md:hidden">
          <List className="size-4" />
          Sumário
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Sumário</SheetTitle>
        </SheetHeader>
        <div className="px-4">
          <ManualToc sections={sections} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
